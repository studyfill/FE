"use client"

import { Search } from "lucide-react"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react"
import type { PDFDocumentProxy } from "pdfjs-dist"

import { Button } from "@/components/ui/button"
import { ImageViewer } from "@/features/pdf/components/ImageViewer"
import { usePdfDocument } from "@/features/pdf/hooks/usePdfDocument"
import type { Material } from "@/types/material"

type PdfViewerProps = {
  material: Material
  onPageChange: (page: number) => void
  highlightPage?: number | null
}

const PDF_RENDER_SCALE = 1.25

type PdfPageCanvasProps = {
  pdfDoc: PDFDocumentProxy
  pageNumber: number
  scrollRootRef: RefObject<HTMLDivElement | null>
  onPageVisible: (page: number) => void
  registerPageRef: (page: number, node: HTMLDivElement | null) => void
}

const PdfPageCanvas = ({
  pdfDoc,
  pageNumber,
  scrollRootRef,
  onPageVisible,
  registerPageRef,
}: PdfPageCanvasProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [shouldRender, setShouldRender] = useState(false)
  const [renderError, setRenderError] = useState(false)

  useEffect(() => {
    registerPageRef(pageNumber, wrapperRef.current)
    return () => registerPageRef(pageNumber, null)
  }, [pageNumber, registerPageRef])

  useEffect(() => {
    const node = wrapperRef.current
    const root = scrollRootRef.current
    if (!node || !root) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            setShouldRender(true)
            onPageVisible(pageNumber)
          }
        }
      },
      { root, threshold: [0.35, 0.5, 0.75] }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [pageNumber, onPageVisible, scrollRootRef])

  useEffect(() => {
    if (!shouldRender || !canvasRef.current) return

    let cancelled = false

    const renderPage = async () => {
      setRenderError(false)
      try {
        const pdfPage = await pdfDoc.getPage(pageNumber)
        if (cancelled || !canvasRef.current) return

        const canvas = canvasRef.current
        const context = canvas.getContext("2d")
        if (!context) return

        const dpr = window.devicePixelRatio || 1
        const viewport = pdfPage.getViewport({ scale: PDF_RENDER_SCALE })
        canvas.width = Math.floor(viewport.width * dpr)
        canvas.height = Math.floor(viewport.height * dpr)
        canvas.style.width = `${Math.floor(viewport.width)}px`
        canvas.style.height = `${Math.floor(viewport.height)}px`

        context.setTransform(dpr, 0, 0, dpr, 0, 0)
        await pdfPage.render({ canvasContext: context, viewport, canvas }).promise
      } catch {
        if (!cancelled) setRenderError(true)
      }
    }

    void renderPage()

    return () => {
      cancelled = true
    }
  }, [shouldRender, pdfDoc, pageNumber])

  return (
    <div
      ref={wrapperRef}
      data-page={pageNumber}
      className="flex w-full justify-center px-4 py-2"
    >
      {renderError ? (
        <div className="flex min-h-40 w-full max-w-2xl items-center justify-center rounded-md border border-dashed border-border bg-white text-sm text-muted-foreground">
          {pageNumber}페이지를 표시할 수 없습니다.
        </div>
      ) : shouldRender ? (
        <canvas
          ref={canvasRef}
          className="rounded-md bg-white shadow-sm"
          aria-label={`PDF 페이지 ${pageNumber}`}
        />
      ) : (
        <div
          className="w-full max-w-2xl rounded-md bg-white/70 shadow-sm"
          style={{ aspectRatio: "1 / 1.414", maxWidth: "680px" }}
          aria-hidden
        />
      )}
    </div>
  )
}

export const PdfViewer = ({
  material,
  onPageChange,
  highlightPage,
}: PdfViewerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const isProgrammaticScroll = useRef(false)
  const lastVisiblePage = useRef(material.currentPage)

  const { pdfDoc, isLoading, error, hasBlob } = usePdfDocument(material.id)
  const [visiblePage, setVisiblePage] = useState(
    highlightPage ?? material.currentPage
  )

  const total = (pdfDoc?.numPages ?? material.pageCount) || 1
  const displayName = material.name.replace(/\.pdf$/i, "")

  const registerPageRef = useCallback(
    (page: number, node: HTMLDivElement | null) => {
      pageRefs.current[page] = node
    },
    []
  )

  const handlePageVisible = useCallback(
    (page: number) => {
      if (isProgrammaticScroll.current) return

      lastVisiblePage.current = page
      setVisiblePage(page)

      if (page !== material.currentPage) {
        onPageChange(page)
      }
    },
    [material.currentPage, onPageChange]
  )

  useEffect(() => {
    if (!pdfDoc) return

    const targetPage = highlightPage ?? material.currentPage
    const scrollToPage = () => {
      const node = pageRefs.current[targetPage]
      if (!node) return false

      isProgrammaticScroll.current = true
      lastVisiblePage.current = targetPage
      setVisiblePage(targetPage)
      node.scrollIntoView({ behavior: "auto", block: "start" })

      window.setTimeout(() => {
        isProgrammaticScroll.current = false
      }, 300)

      return true
    }

    if (scrollToPage()) return

    const timer = window.setTimeout(scrollToPage, 100)
    return () => window.clearTimeout(timer)
  }, [pdfDoc, material.id, highlightPage, material.currentPage])

  if (material.fileType === "image") {
    return <ImageViewer material={material} />
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {visiblePage}p / {total}
          </p>
        </div>
        <div className="flex items-center gap-1">
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

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto bg-muted/20"
      >
        {material.extractionStatus !== "done" ? (
          <div className="flex min-h-full items-center justify-center p-4">
            <p className="text-sm text-muted-foreground">
              텍스트 추출이 완료되면 뷰어를 사용할 수 있습니다.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex min-h-full items-center justify-center p-4">
            <p className="text-sm text-muted-foreground">PDF를 불러오는 중…</p>
          </div>
        ) : hasBlob === false ? (
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="space-y-2 px-6 text-center">
              <p className="text-sm font-medium">PDF 파일 없음</p>
              <p className="text-xs text-muted-foreground">
                이 자료는 샘플 데이터입니다. PDF를 새로 업로드하면 뷰어에서
                확인할 수 있습니다.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-full items-center justify-center p-4">
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          </div>
        ) : pdfDoc ? (
          <div className="flex flex-col pb-6 pt-3">
            {Array.from({ length: total }, (_, index) => (
              <PdfPageCanvas
                key={`${material.id}-page-${index + 1}`}
                pdfDoc={pdfDoc}
                pageNumber={index + 1}
                scrollRootRef={scrollRef}
                onPageVisible={handlePageVisible}
                registerPageRef={registerPageRef}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
