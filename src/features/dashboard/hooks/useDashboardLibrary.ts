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
import { listMaterials, moveMaterial, uploadMaterial } from "@/lib/mocks/materials"
import { getPdfPageCountFromFile } from "@/lib/utils/pdf-page-count"
import { getFolderAncestorPath } from "@/lib/utils/folder-path"
import type { MaterialSort, MaterialViewLayout } from "@/types/material"

export const useDashboardLibrary = (folderId: string | null) => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [sort, setSort] = useState<MaterialSort>("recent")
  const [viewLayout, setViewLayout] = useState<MaterialViewLayout>("grid")
  const [childFolders, setChildFolders] = useState<
    ReturnType<typeof listChildFolders>
  >([])
  const [materials, setMaterials] = useState<ReturnType<typeof listMaterials>>([])
  const [folderTree, setFolderTree] = useState<ReturnType<typeof listFolderTree>>(
    []
  )
  const [recentFolders, setRecentFolders] = useState<
    ReturnType<typeof listRecentFolders>
  >([])
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
  const refresh = useCallback(() => {
    setFolderTree(listFolderTree())
    setRecentFolders(listRecentFolders())
    setChildFolders(listChildFolders(folderId))
    setMaterials(listMaterials({ folderId, sort }))
  }, [folderId, sort])

  useEffect(() => {
    refresh()
  }, [refresh])

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
        router.push(ROUTES.dashboardFolder(folder.id))
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
      const pageCount = await getPdfPageCountFromFile(file)
      await uploadMaterial(file, uploadFolderId, pageCount)
      if (uploadFolderId) recordRecentFolder(uploadFolderId)
      refresh()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "업로드에 실패했습니다.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleMoveMaterial = (materialId: string, targetFolderId: string) => {
    try {
      moveMaterial(materialId, targetFolderId)
      setMoveError(null)
      refresh()
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
    materials,
    childFolders,
    folderTree,
    recentFolders,
    totalCount: materials.length,
    folderCount: childFolders.length,
    isHome: folderId === null,
    folderLabel,
    folderPath,
    isUploading,
    uploadError,
    handleUpload,
    handleCreateFolder,
    isCreatingFolder,
    createFolderError,
    moveError,
    handleMoveMaterial,
    handleMoveFolder,
    refresh,
  }
}
