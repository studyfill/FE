"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

import { ROUTES } from "@/constants/routes"
import type { FolderColorId } from "@/constants/folder-colors"
import { createFolder, getFolder, listChildFolders, listFolderTree, moveFolder } from "@/lib/mocks/folders"
import {
  listRecentFolders,
  recordRecentFolder,
} from "@/lib/mocks/recent-folders"
import { loadMockStore } from "@/lib/mocks/mock-store"
import {
  getUserFile,
  processUserFileLocally,
  sortUserFiles,
} from "@/lib/mocks/user-files"
import {
  listFiles,
  moveFile,
  uploadFileToBackend,
  validateUploadFile,
} from "@/lib/api/files"
import { getFileTypeFromName } from "@/lib/utils/upload-file"
import { getPdfPageCountFromFile } from "@/lib/utils/pdf-page-count"
import { getFolderAncestorPath } from "@/lib/utils/folder-path"
import type { UserFile, UserFileSort, UserFileViewLayout } from "@/types/user-file"

export const useLibrary = (folderId: string | null) => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [sort, setSort] = useState<UserFileSort>("recent")
  const [viewLayout, setViewLayout] = useState<UserFileViewLayout>("grid")
  const [childFolders, setChildFolders] = useState<
    ReturnType<typeof listChildFolders>
  >([])
  const [userFiles, setUserFiles] = useState<UserFile[]>([])
  const [folderTree, setFolderTree] = useState<ReturnType<typeof listFolderTree>>(
    []
  )
  const [recentFolders, setRecentFolders] = useState<
    ReturnType<typeof listRecentFolders>
  >([])
  const [isLoadingUserFiles, setIsLoadingUserFiles] = useState(true)
  const [userFilesError, setUserFilesError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [createFolderError, setCreateFolderError] = useState<string | null>(null)
  const [moveError, setMoveError] = useState<string | null>(null)

  const uploadFolderId = useMemo(() => {
    if (!folderId) return null

    const { folders } = loadMockStore()
    const hasChildren = folders.some((f) => f.parentId === folderId)
    if (hasChildren) return null

    return folderId
  }, [folderId])

  const folderLabel = useMemo(() => {
    if (!folderId) return "내 라이브러리"
    return getFolder(folderId)?.name ?? "폴더"
  }, [folderId])

  const folderPath = useMemo(() => {
    if (!folderId) return []
    const { folders } = loadMockStore()
    return getFolderAncestorPath(folderId, folders)
  }, [folderId, folderTree])

  // 검색은 배포 백엔드(useLibrarySearch)가 담당한다. 폴더/자료 목록은 현재 폴더 기준만 노출.
  // 폴더는 mock, 자료(files)는 실 백엔드(BFF 경유). 둘은 출처가 다르므로 별도 로딩한다.
  const loadFolders = useCallback(() => {
    setFolderTree(listFolderTree())
    setRecentFolders(listRecentFolders())
    setChildFolders(listChildFolders(folderId))
  }, [folderId])

  const loadUserFiles = useCallback(async () => {
    setIsLoadingUserFiles(true)
    setUserFilesError(null)
    try {
      const fetched = await listFiles(folderId)
      // study/note/blank 콘텐츠는 로컬에서 처리되고, 로컬 미러가 없으면 study 진입 시
      // 백엔드에서 하이드레이트하므로 모든 백엔드 자료는 열람 가능(extractionStatus "done")하다.
      // (백엔드 analysisStatus는 미배포 AI 분석 파이프라인 상태라 진입 가능 여부의 근거가 아님)
      // 진행상태(currentPage/progressPercent/lastStudiedAt)는 로컬 미러와 병합한다.
      const merged: UserFile[] = fetched.map((m) => {
        const local = getUserFile(m.id)
        return local
          ? {
              ...m,
              extractionStatus: local.extractionStatus,
              pageCount: local.pageCount || m.pageCount,
              currentPage: local.currentPage,
              progressPercent: local.progressPercent,
              lastStudiedAt: local.lastStudiedAt ?? m.lastStudiedAt,
            }
          : { ...m, extractionStatus: "done" }
      })
      setUserFiles(sortUserFiles(merged, sort))
    } catch (err) {
      setUserFiles([])
      setUserFilesError(
        err instanceof Error ? err.message : "자료를 불러오지 못했습니다."
      )
    } finally {
      setIsLoadingUserFiles(false)
    }
  }, [folderId, sort])

  const refresh = useCallback(() => {
    loadFolders()
    void loadUserFiles()
  }, [loadFolders, loadUserFiles])

  useEffect(() => {
    loadFolders()
  }, [loadFolders])

  useEffect(() => {
    void loadUserFiles()
  }, [loadUserFiles])

  useEffect(() => {
    if (!folderId) return
    recordRecentFolder(folderId)
    setRecentFolders(listRecentFolders())
  }, [folderId])

  useEffect(() => {
    if (!moveError) return
    const timer = window.setTimeout(() => setMoveError(null), 4000)
    return () => window.clearTimeout(timer)
  }, [moveError])

  const handleCreateFolder = async (
    name: string,
    color: FolderColorId,
    parentId: string | null = null
  ) => {
    setIsCreatingFolder(true)
    setCreateFolderError(null)
    try {
      const folder = createFolder(name, color, parentId)
      recordRecentFolder(folder.id)
      refresh()
      if (parentId) {
        recordRecentFolder(parentId)
      } else {
        router.push(ROUTES.libraryFolder(folder.id))
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "폴더를 만들지 못했습니다."
      setCreateFolderError(message)
      throw err
    } finally {
      setIsCreatingFolder(false)
    }
  }

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    setUploadError(null)
    try {
      const validationError = validateUploadFile(file)
      if (validationError) throw new Error(validationError)

      const fileType = getFileTypeFromName(file.name)
      if (!fileType) throw new Error("지원하지 않는 파일 형식입니다 (PDF, JPG, PNG).")

      const pageCount =
        fileType === "pdf" ? await getPdfPageCountFromFile(file) : 1

      // 1) 백엔드 저장(DB 적재) → 2) 백엔드 id 로 로컬 처리(미배포 study 기능용) → 3) 목록 새로고침
      const uploaded = await uploadFileToBackend(file, {
        folderId: uploadFolderId,
        name: file.name,
      })
      if (uploaded.id) {
        await processUserFileLocally({
          id: uploaded.id,
          name: uploaded.name ?? file.name,
          folderId: uploaded.folderId ?? uploadFolderId,
          fileType,
          file,
          pageCount,
        })
      }
      if (uploadFolderId) recordRecentFolder(uploadFolderId)
      await loadUserFiles()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "업로드에 실패했습니다.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleMoveUserFile = async (
    userFileId: string,
    targetFolderId: string
  ) => {
    try {
      await moveFile(userFileId, targetFolderId)
      setMoveError(null)
      await loadUserFiles()
    } catch (err) {
      setMoveError(
        err instanceof Error ? err.message : "자료를 이동하지 못했습니다."
      )
    }
  }

  const handleMoveFolder = (folderIdToMove: string, targetFolderId: string) => {
    try {
      moveFolder(folderIdToMove, targetFolderId)
      setMoveError(null)
      refresh()
    } catch (err) {
      setMoveError(
        err instanceof Error ? err.message : "폴더를 이동하지 못했습니다."
      )
    }
  }

  return {
    searchQuery,
    setSearchQuery,
    sort,
    setSort,
    viewLayout,
    setViewLayout,
    userFiles,
    childFolders,
    folderTree,
    recentFolders,
    totalCount: userFiles.length,
    folderCount: childFolders.length,
    isHome: folderId === null,
    folderLabel,
    folderPath,
    isLoadingUserFiles,
    userFilesError,
    isUploading,
    uploadError,
    handleUpload,
    handleCreateFolder,
    isCreatingFolder,
    createFolderError,
    moveError,
    handleMoveUserFile,
    handleMoveFolder,
    refresh,
  }
}
