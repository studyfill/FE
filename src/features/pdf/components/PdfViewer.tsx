"use client"

import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePdfDocument } from "@/features/pdf/hooks/usePdfDocument"
import type { Material } from "@/types/material"

type PdfViewerProps = {
  material: Material
  onPageChange: (page: number) => void
  highlightPage?: number | null
}

export const PdfViewer = ({
  material,
  onPageChange,
  highlightPage,
}: PdfViewerProps) => {
  const page = highlightPage ?? material.currentPage
  const total = material.pageCount || 1
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { pdfDoc, isLoading, error, hasBlob } = usePdfDocument(material.id)
  const [renderError, setRenderError] = useState<string | null>(null)

  const displayName = material.name.replace(/\.pdf$/i, "")

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return

    let cancelled = false

    const renderPage = async () => {
      setRenderError(null)
      try {
        const pdfPage = await pdfDoc.getPage(page)
        if (cancelled || !canvasRef.current) return

        const canvas = canvasRef.current
        const context = canvas.getContext("2d")
        if (!context) return

        const dpr = window.devicePixelRatio || 1
        const viewport = pdfPage.getViewport({ scale: 1.25 })
        canvas.width = Math.floor(viewport.width * dpr)
        canvas.height = Math.floor(viewport.height * dpr)
        canvas.style.width = `${Math.floor(viewport.width)}px`
        canvas.style.height = `${Math.floor(viewport.height)}px`

        context.setTransform(dpr, 0, 0, dpr, 0, 0)
        await pdfPage.render({ canvasContext: context, viewport, canvas }).promise
      } catch {
        if (!cancelled) {
          setRenderError("페이지를 렌더링하지 못했습니다.")
        }
      }
    }

    void renderPage()

    return () => {
      cancelled = true
    }
  }, [pdfDoc, page])

  const handlePrev = () => onPageChange(page - 1)
  const handleNext = () => onPageChange(page + 1)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {page}p / {total}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handlePrev}
            disabled={page <= 1}
            aria-label="이전 페이지"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleNext}
            disabled={page >= total}
            aria-label="다음 페이지"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled
            aria-label="검색 (준비 중)"
          >
            <Search className="size-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 bg-muted/20">
        <div className="flex min-h-full justify-center p-4">
          {material.extractionStatus !== "done" ? (
            <p className="self-center text-sm text-muted-foreground">
              텍스트 추출이 완료되면 뷰어를 사용할 수 있습니다.
            </p>
          ) : isLoading ? (
            <p className="self-center text-sm text-muted-foreground">
              PDF를 불러오는 중…
            </p>
          ) : hasBlob === false ? (
            <div className="self-center space-y-2 px-6 text-center">
              <p className="text-sm font-medium">PDF 파일 없음</p>
              <p className="text-xs text-muted-foreground">
                이 자료는 샘플 데이터입니다. PDF를 새로 업로드하면 뷰어에서
                확인할 수 있습니다.
              </p>
            </div>
          ) : error || renderError ? (
            <p className="self-center text-sm text-destructive" role="alert">
              {error ?? renderError}
            </p>
          ) : (
            <canvas
              ref={canvasRef}
              className="rounded-md bg-white shadow-sm"
              aria-label={`PDF 페이지 ${page}`}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
