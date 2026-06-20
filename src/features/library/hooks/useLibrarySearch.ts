"use client"

import { useEffect, useRef, useState } from "react"

import { searchLibrary } from "@/lib/api/search"
import { ApiError } from "@/lib/api/errors"
import type { SearchResponse } from "@/lib/api/types"

const DEBOUNCE_MS = 300

type LibrarySearchState = {
  isActive: boolean
  isLoading: boolean
  error: string | null
  results: SearchResponse | null
}

/** 사이드바 검색어를 디바운스해 배포 백엔드 검색 API를 호출한다. */
export const useLibrarySearch = (query: string): LibrarySearchState => {
  const trimmed = query.trim()
  const isActive = trimmed.length > 0
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResponse | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (!isActive) {
      requestIdRef.current += 1
      setIsLoading(false)
      setError(null)
      setResults(null)
      return
    }

    const requestId = ++requestIdRef.current
    setIsLoading(true)
    setError(null)

    const timer = window.setTimeout(async () => {
      try {
        const data = await searchLibrary(trimmed)
        if (requestId !== requestIdRef.current) return
        setResults(data)
      } catch (err) {
        if (requestId !== requestIdRef.current) return
        setResults(null)
        setError(
          err instanceof ApiError ? err.message : "검색에 실패했습니다.",
        )
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [trimmed, isActive])

  return { isActive, isLoading, error, results }
}
