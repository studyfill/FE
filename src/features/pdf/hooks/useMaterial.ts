"use client"

import { useCallback, useEffect, useState } from "react"

import {
  getMaterial,
  hydrateMaterialFromBackend,
  updateMaterial,
} from "@/lib/mocks/materials"
import type { Material } from "@/types/material"

export const useMaterial = (materialId: string) => {
  const [material, setMaterial] = useState<Material | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  const refresh = useCallback(() => setReloadKey((key) => key + 1), [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    const local = getMaterial(materialId)
    if (local) {
      setMaterial(local)
      setIsLoading(false)
      return
    }

    // 로컬 미러 없음(다른 기기 업로드 등) → 백엔드에서 받아 로컬 처리 후 진입
    hydrateMaterialFromBackend(materialId)
      .then((hydrated) => {
        if (!cancelled) setMaterial(hydrated)
      })
      .catch(() => {
        if (!cancelled) setMaterial(undefined)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [materialId, reloadKey])

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
