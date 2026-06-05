"use client"

import { Lightbulb, Upload, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { PDF_UPLOAD_MAX_PAGES, PDF_UPLOAD_MAX_SIZE_MB } from "@/constants/upload"
import { Button } from "@/components/ui/button"
import { validatePdfFile } from "@/lib/mocks/materials"
import { cn } from "@/lib/utils"

type PdfUploadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (file: File) => Promise<void>
  isUploading?: boolean
}

export const PdfUploadDialog = ({
  open,
  onOpenChange,
  onUpload,
  isUploading = false,
}: PdfUploadDialogProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) {
      setIsDragging(false)
      setLocalError(null)
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isUploading) onOpenChange(false)
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, isUploading, onOpenChange])

  const handleClose = () => {
    if (isUploading) return
    onOpenChange(false)
  }

  const processFile = useCallback(
    async (file: File) => {
      const validationError = validatePdfFile(file)
      if (validationError) {
        setLocalError(validationError)
        return
      }

      setLocalError(null)
      try {
        await onUpload(file)
        onOpenChange(false)
      } catch (err) {
        setLocalError(
          err instanceof Error ? err.message : "업로드에 실패했습니다."
        )
      }
    },
    [onUpload, onOpenChange]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void processFile(file)
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (isUploading) return

    const file = e.dataTransfer.files?.[0]
    if (file) void processFile(file)
  }

  if (!mounted || !open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="업로드 창 닫기"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-upload-title"
        className="relative z-10 w-full max-w-[480px] overflow-hidden rounded-xl bg-card shadow-xl ring-1 ring-border/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2
            id="pdf-upload-title"
            className="text-base font-semibold text-foreground"
          >
            PDF 업로드
          </h2>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={handleClose}
            disabled={isUploading}
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-5 py-5">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="sr-only"
            onChange={handleInputChange}
            aria-hidden
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setIsDragging(false)
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={cn(
              "flex w-full flex-col items-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
              isDragging
                ? "border-primary/60 bg-primary/5"
                : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
            )}
          >
            <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Upload className="size-6" strokeWidth={2.25} />
            </span>
            <span className="text-base font-semibold text-foreground">
              PDF를 여기에 끌어다 놓으세요
            </span>
            <span className="mt-2 text-sm text-muted-foreground">
              또는 클릭하여 파일 선택 · 최대 {PDF_UPLOAD_MAX_SIZE_MB}MB ·{" "}
              {PDF_UPLOAD_MAX_PAGES}페이지
            </span>
            {isUploading ? (
              <span className="mt-3 text-sm font-medium text-primary">
                업로드 중…
              </span>
            ) : null}
          </button>
          {localError ? (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {localError}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border bg-muted/40 px-5 py-4">
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Lightbulb
              className="mt-0.5 size-4 shrink-0 text-amber-500"
              aria-hidden
            />
            <span>스캔본(이미지) PDF는 추출이 어려울 수 있어요</span>
          </p>
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            disabled={isUploading}
            onClick={handleClose}
          >
            취소
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
