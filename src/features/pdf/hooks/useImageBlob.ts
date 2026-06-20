"use client"

import { useEffect, useState } from "react"

import { getPdfBlob } from "@/lib/storage/pdf-blob-store"

export const useImageBlob = (userFileId: string) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasBlob, setHasBlob] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    let url: string | null = null

    const load = async () => {
      setIsLoading(true)
      setObjectUrl(null)

      try {
        const blob = await getPdfBlob(userFileId)
        if (cancelled) return

        if (!blob) {
          setHasBlob(false)
          setIsLoading(false)
          return
        }

        setHasBlob(true)
        const mimeType = detectImageMime(blob)
        url = URL.createObjectURL(new Blob([blob], { type: mimeType }))
        if (!cancelled) {
          setObjectUrl(url)
        }
      } catch {
        if (!cancelled) {
          setHasBlob(false)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [userFileId])

  return { objectUrl, isLoading, hasBlob }
}

const detectImageMime = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer.slice(0, 4))
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg"
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return "image/png"
  return "image/jpeg"
}
