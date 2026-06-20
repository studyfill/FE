"use client"

import { useEffect, useState } from "react"
import type { PDFDocumentProxy } from "pdfjs-dist"

import { loadPdfJs } from "@/lib/pdf/pdfjs-config"
import { getPdfBlob } from "@/lib/storage/pdf-blob-store"

export const usePdfDocument = (userFileId: string) => {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasBlob, setHasBlob] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    let loadingTask: Awaited<
      ReturnType<Awaited<ReturnType<typeof loadPdfJs>>["getDocument"]>
    > | null = null

    const load = async () => {
      setIsLoading(true)
      setError(null)
      setPdfDoc(null)

      try {
        const blob = await getPdfBlob(userFileId)
        if (cancelled) return

        if (!blob) {
          setHasBlob(false)
          setIsLoading(false)
          return
        }

        setHasBlob(true)
        const pdfjs = await loadPdfJs()
        loadingTask = pdfjs.getDocument({ data: blob, useSystemFonts: true })
        const doc = await loadingTask.promise

        if (!cancelled) {
          setPdfDoc(doc)
        } else {
          void loadingTask.destroy()
        }
      } catch {
        if (!cancelled) {
          setError("PDF를 불러오지 못했습니다.")
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
      if (loadingTask) {
        void loadingTask.destroy()
      }
    }
  }, [userFileId])

  return { pdfDoc, isLoading, error, hasBlob }
}
