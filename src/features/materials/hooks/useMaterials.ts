"use client"

import { useCallback, useEffect, useState } from "react"

import { listMaterials, uploadMaterial } from "@/lib/mocks/materials"
import type { Material } from "@/types/material"

export const useMaterials = (folderId?: string) => {
  const [materials, setMaterials] = useState<Material[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setMaterials(listMaterials(folderId))
  }, [folderId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    setUploadError(null)
    try {
      await uploadMaterial(file)
      refresh()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "업로드에 실패했습니다.")
    } finally {
      setIsUploading(false)
    }
  }

  return {
    materials,
    isUploading,
    uploadError,
    refresh,
    handleUpload,
  }
}
