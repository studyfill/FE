"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

import { ROUTES } from "@/constants/routes"
import type { FolderColorId } from "@/constants/folder-colors"
import {
  createFolder,
  deleteFolder,
  fetchFolderTree,
  getCachedFolder,
  getCachedFolderList,
  listChildFolders,
  listFavoriteFolders,
  moveFolder,
  toggleFolderFavorite,
} from "@/lib/api/folders"
import {
  listRecentFolders,
  recordRecentFolder,
  removeRecentFolder,
} from "@/lib/api/recent-folders"
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
import type {
  FolderListItem,
  FolderTreeNode,
  RecentFolderItem,
  UserFile,
  UserFileSort,
  UserFileViewLayout,
} from "@/types/user-file"

export const useLibrary = (folderId: string | null) => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [sort, setSort] = useState<UserFileSort>("recent")
  const [viewLayout, setViewLayout] = useState<UserFileViewLayout>("grid")
  const [childFolders, setChildFolders] = useState<FolderListItem[]>([])
  const [userFiles, setUserFiles] = useState<UserFile[]>([])
  const [folderTree, setFolderTree] = useState<FolderTreeNode[]>([])
  const [favoriteFolders, setFavoriteFolders] = useState<FolderListItem[]>([])
  const [recentFolders, setRecentFolders] = useState<RecentFolderItem[]>([])
  const [isLoadingUserFiles, setIsLoadingUserFiles] = useState(true)
  const [userFilesError, setUserFilesError] = useState<string | null>(null)
  const [foldersError, setFoldersError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [createFolderError, setCreateFolderError] = useState<string | null>(null)
  const [moveError, setMoveError] = useState<string | null>(null)
  const [folderActionError, setFolderActionError] = useState<string | null>(null)

  // leaf 폴더에만 업로드 — 현재 폴더에 하위 폴더가 있으면 업로드 차단
  const uploadFolderId = useMemo(() => {
    if (!folderId) return null
    if (childFolders.length > 0) return null
    return folderId
  }, [folderId, childFolders])

  const folderLabel = useMemo(() => {
    if (!folderId) return "내 라이브러리"
    return getCachedFolder(folderId)?.name ?? "폴더"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId, folderTree])

  const folderPath = useMemo(() => {
    if (!folderId) return []
    return getFolderAncestorPath(folderId, getCachedFolderList())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId, folderTree])

  // 폴더는 실 백엔드(BFF 경유), 자료(files)도 실 백엔드. 출처가 같아졌지만 로딩 시점이 달라 별도로 로드한다.
  const loadFolders = useCallback(async () => {
    setFoldersError(null)
    try {
      const [tree, children, favorites] = await Promise.all([
        fetchFolderTree(),
        listChildFolders(folderId),
        listFavoriteFolders(),
      ])
      setFolderTree(tree)
      setChildFolders(children)
      setFavoriteFolders(favorites)
      setRecentFolders(listRecentFolders())
    } catch (err) {
      setFoldersError(
        err instanceof Error ? err.message : "폴더를 불러오지 못했습니다."
      )
    }
  }, [folderId])

  const loadUserFiles = useCallback(async () => {
    setIsLoadingUserFiles(true)
    setUserFilesError(null)
    try {
      const fetched = await listFiles(folderId)
      // study/note/blank 콘텐츠는 로컬에서 처리되고, 로컬 미러가 없으면 study 진입 시
      // 백엔드에서 하이드레이트하므로 모든 백엔드 자료는 열람 가능(extractionStatus "done")하다.
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
    void loadFolders()
    void loadUserFiles()
  }, [loadFolders, loadUserFiles])

  useEffect(() => {
    void loadFolders()
  }, [loadFolders])

  useEffect(() => {
    void loadUserFiles()
  }, [loadUserFiles])

  useEffect(() => {
    if (!folderId) return
    recordRecentFolder(folderId)
  }, [folderId])

  useEffect(() => {
    if (!moveError) return
    const timer = window.setTimeout(() => setMoveError(null), 4000)
    return () => window.clearTimeout(timer)
  }, [moveError])

  useEffect(() => {
    if (!folderActionError) return
    const timer = window.setTimeout(() => setFolderActionError(null), 4000)
    return () => window.clearTimeout(timer)
  }, [folderActionError])

  const handleCreateFolder = async (
    name: string,
    color: FolderColorId,
    parentId: string | null = null
  ) => {
    setIsCreatingFolder(true)
    setCreateFolderError(null)
    try {
      const folder = await createFolder(name, color, parentId)
      if (folder.id) recordRecentFolder(folder.id)
      refresh()
      if (parentId) {
        recordRecentFolder(parentId)
      } else if (folder.id) {
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

  const handleMoveFolder = async (
    folderIdToMove: string,
    targetFolderId: string | null
  ) => {
    try {
      await moveFolder(folderIdToMove, targetFolderId)
      setMoveError(null)
      refresh()
    } catch (err) {
      setMoveError(
        err instanceof Error ? err.message : "폴더를 이동하지 못했습니다."
      )
      throw err
    }
  }

  const handleToggleFavorite = async (folderIdToToggle: string) => {
    try {
      await toggleFolderFavorite(folderIdToToggle)
      setFolderActionError(null)
      refresh()
    } catch (err) {
      setFolderActionError(
        err instanceof Error ? err.message : "즐겨찾기를 변경하지 못했습니다."
      )
    }
  }

  const handleDeleteFolder = async (folderIdToDelete: string) => {
    const parentId = getCachedFolder(folderIdToDelete)?.parentId ?? null
    const affectsCurrent =
      folderId === folderIdToDelete ||
      folderPath.some((folder) => folder.id === folderIdToDelete)
    try {
      await deleteFolder(folderIdToDelete)
      removeRecentFolder(folderIdToDelete)
      setFolderActionError(null)
      if (affectsCurrent) {
        router.push(parentId ? ROUTES.libraryFolder(parentId) : ROUTES.library)
      }
      refresh()
    } catch (err) {
      setFolderActionError(
        err instanceof Error ? err.message : "폴더를 삭제하지 못했습니다."
      )
      throw err
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
    favoriteFolders,
    recentFolders,
    totalCount: userFiles.length,
    folderCount: childFolders.length,
    isHome: folderId === null,
    folderLabel,
    folderPath,
    isLoadingUserFiles,
    userFilesError,
    foldersError,
    isUploading,
    uploadError,
    handleUpload,
    handleCreateFolder,
    isCreatingFolder,
    createFolderError,
    moveError,
    folderActionError,
    handleMoveUserFile,
    handleMoveFolder,
    handleToggleFavorite,
    handleDeleteFolder,
    refresh,
  }
}
