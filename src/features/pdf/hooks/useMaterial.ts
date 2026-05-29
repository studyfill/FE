"use client"

import { useCallback, useEffect, useState } from "react"

import { getMaterial, updateMaterial } from "@/lib/mocks/materials"
import type { Material } from "@/types/material"

export const useMaterial = (materialId: string) => {
  const [material, setMaterial] = useState<Material | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(() => {
    const found = getMaterial(materialId)
    setMaterial(found)
    setIsLoading(false)
  }, [materialId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const setPage = (page: number) => {
    if (!material) return
    const next = Math.min(Math.max(1, page), material.pageCount || 1)
    const updated = updateMaterial(materialId, {
      currentPage: next,
      lastStudiedAt: new Date().toISOString(),
    })
    if (updated) setMaterial(updated)
  }

  return { material, isLoading, refresh, setPage }
}
