"use client"

import { TriangleAlert, X } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

import { Button } from "@/components/ui/button"
import { useLibraryContext } from "@/features/library/context/LibraryContext"
import { getFolderDeletePreview } from "@/lib/api/folders"
import type { FolderListItem } from "@/types/user-file"

type DeleteFolderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  folder: FolderListItem
}

type Preview = { subFolderCount: number; fileCount: number }

export const DeleteFolderDialog = ({
  open,
  onOpenChange,
  folder,
}: DeleteFolderDialogProps) => {
  const { handleDeleteFolder } = useLibraryContext()
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) {
      setPreview(null)
      setLocalError(null)
      setIsSubmitting(false)
      return
    }

    let active = true
    getFolderDeletePreview(folder.id)
      .then((res) => {
        if (active)
          setPreview({
            subFolderCount: res.subFolderCount ?? 0,
            fileCount: res.fileCount ?? 0,
          })
      })
      .catch(() => {
        if (active) setPreview({ subFolderCount: 0, fileCount: 0 })
      })

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onOpenChange(false)
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      active = false
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, folder.id, isSubmitting, onOpenChange])

  const handleConfirm = async () => {
    setIsSubmitting(true)
    setLocalError(null)
    try {
      await handleDeleteFolder(folder.id)
      onOpenChange(false)
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "폴더를 삭제하지 못했습니다."
      )
      setIsSubmitting(false)
    }
  }

  if (!mounted || !open) return null

  const hasContents =
    !!preview && (preview.subFolderCount > 0 || preview.fileCount > 0)

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="폴더 삭제 창 닫기"
        onClick={() => !isSubmitting && onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-folder-title"
        className="relative z-10 w-full max-w-dialog-sm overflow-hidden rounded-xl bg-card shadow-xl ring-1 ring-border/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <h2
            id="delete-folder-title"
            className="flex items-center gap-2 text-lg font-semibold text-foreground"
          >
            <TriangleAlert className="size-5 text-destructive" />
            폴더 삭제
          </h2>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 pb-5">
          <p className="text-body text-foreground">
            <span className="font-semibold">{folder.name}</span> 폴더를
            삭제할까요?
          </p>
          {hasContents ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-body-sm text-foreground">
              이 폴더를 삭제하면{" "}
              {preview!.subFolderCount > 0 ? (
                <>
                  하위 <span className="font-semibold">{preview!.subFolderCount}개 폴더</span>
                  {preview!.fileCount > 0 ? "와 " : "도 "}
                </>
              ) : null}
              {preview!.fileCount > 0 ? (
                <>
                  <span className="font-semibold">{preview!.fileCount}개 자료</span>도{" "}
                </>
              ) : null}
              함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </div>
          ) : (
            <p className="text-body-sm text-muted-foreground">
              이 작업은 되돌릴 수 없습니다.
            </p>
          )}
          {localError ? (
            <p className="text-sm text-destructive" role="alert">
              {localError}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type="button"
            className="min-w-[4.5rem] bg-destructive text-white hover:bg-destructive/90"
            disabled={isSubmitting}
            onClick={() => void handleConfirm()}
          >
            {isSubmitting ? "삭제 중…" : "삭제"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
