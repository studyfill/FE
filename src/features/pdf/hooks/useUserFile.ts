"use client"

import { useCallback, useEffect, useState } from "react"

import {
  getUserFile,
  hydrateUserFileFromBackend,
  updateUserFile,
} from "@/lib/mocks/user-files"
import type { UserFile } from "@/types/user-file"

export const useUserFile = (userFileId: string) => {
  const [userFile, setUserFile] = useState<UserFile | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  const refresh = useCallback(() => setReloadKey((key) => key + 1), [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    const local = getUserFile(userFileId)
    if (local) {
      setUserFile(local)
      setIsLoading(false)
      return
    }

    // 로컬 미러 없음(다른 기기 업로드 등) → 백엔드에서 받아 로컬 처리 후 진입
    hydrateUserFileFromBackend(userFileId)
      .then((hydrated) => {
        if (!cancelled) setUserFile(hydrated)
      })
      .catch(() => {
        if (!cancelled) setUserFile(undefined)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userFileId, reloadKey])

  const setPage = (page: number) => {
    if (!userFile) return
    const next = Math.min(Math.max(1, page), userFile.pageCount || 1)
    const updated = updateUserFile(userFileId, {
      currentPage: next,
      lastStudiedAt: new Date().toISOString(),
    })
    if (updated) setUserFile(updated)
  }

  return { userFile, isLoading, refresh, setPage }
}
