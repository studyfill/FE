"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

import { ROUTES } from "@/constants/routes"
import type { FolderColorId } from "@/constants/folder-colors"
import { createFolder, getFolder, listFolderTree } from "@/lib/mocks/folders"
import {
  listRecentFolders,
  recordRecentFolder,
} from "@/lib/mocks/recent-folders"
import { loadMockStore } from "@/lib/mocks/mock-store"
import { listMaterials, uploadMaterial } from "@/lib/mocks/materials"
import { getPdfPageCountFromFile } from "@/lib/utils/pdf-page-count"
import type { MaterialSort } from "@/types/material"

export const useDashboardLibrary = (folderId: string | null) => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [sort, setSort] = useState<MaterialSort>("date")
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

  const refresh = useCallback(() => {
    setFolderTree(listFolderTree())
    setRecentFolders(listRecentFolders())
    setMaterials(
      listMaterials({
        folderId: searchQuery.trim() ? null : folderId,
        searchQuery,
        sort,
      })
    )
  }, [folderId, searchQuery, sort])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!folderId) return
    recordRecentFolder(folderId)
    setRecentFolders(listRecentFolders())
  }, [folderId])

  const handleCreateFolder = async (name: string, color: FolderColorId) => {
    setIsCreatingFolder(true)
    setCreateFolderError(null)
    try {
      const folder = createFolder(name, color, null)
      recordRecentFolder(folder.id)
      refresh()
      router.push(ROUTES.dashboardFolder(folder.id))
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

  return {
    searchQuery,
    setSearchQuery,
    sort,
    setSort,
    materials,
    folderTree,
    recentFolders,
    totalCount: materials.length,
    isHome: folderId === null,
    folderLabel,
    isUploading,
    uploadError,
    handleUpload,
    handleCreateFolder,
    isCreatingFolder,
    createFolderError,
    refresh,
  }
}
