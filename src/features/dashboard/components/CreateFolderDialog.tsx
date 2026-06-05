"use client"

import { Folder, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DEFAULT_FOLDER_COLOR,
  FOLDER_COLOR_OPTIONS,
  type FolderColorId,
} from "@/constants/folder-colors"
import { cn } from "@/lib/utils"

type CreateFolderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string, color: FolderColorId) => Promise<void>
  isSubmitting?: boolean
}

export const CreateFolderDialog = ({
  open,
  onOpenChange,
  onCreate,
  isSubmitting = false,
}: CreateFolderDialogProps) => {
  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState("")
  const [color, setColor] = useState<FolderColorId>(DEFAULT_FOLDER_COLOR)
  const [localError, setLocalError] = useState<string | null>(null)

  const previewName = name.trim() || "폴더 이름"
  const previewTheme =
    FOLDER_COLOR_OPTIONS.find((option) => option.id === color)?.theme ??
    FOLDER_COLOR_OPTIONS[0].theme

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) {
      setName("")
      setColor(DEFAULT_FOLDER_COLOR)
      setLocalError(null)
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onOpenChange(false)
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, isSubmitting, onOpenChange])

  const handleClose = () => {
    if (isSubmitting) return
    onOpenChange(false)
  }

  const handleSubmit = useCallback(async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setLocalError("폴더 이름을 입력해 주세요.")
      return
    }

    setLocalError(null)
    try {
      await onCreate(trimmed, color)
      onOpenChange(false)
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "폴더를 만들지 못했습니다."
      )
    }
  }, [color, name, onCreate, onOpenChange])

  if (!mounted || !open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="새 폴더 창 닫기"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-folder-title"
        className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-xl bg-card shadow-xl ring-1 ring-border/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <h2
            id="create-folder-title"
            className="text-lg font-semibold text-foreground"
          >
            새 폴더
          </h2>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 px-5 pb-5">
          <div className="space-y-2">
            <label
              htmlFor="folder-name"
              className="text-sm text-muted-foreground"
            >
              폴더 이름
            </label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (localError) setLocalError(null)
              }}
              placeholder="예) 전공 수업"
              disabled={isSubmitting}
              className="h-11 rounded-lg text-[15px]"
              autoFocus
            />
          </div>

          <div className="space-y-2.5">
            <span className="text-sm text-muted-foreground">색상</span>
            <div
              className="flex flex-wrap gap-2.5"
              role="radiogroup"
              aria-label="폴더 색상"
            >
              {FOLDER_COLOR_OPTIONS.map((option) => {
                const selected = color === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`${option.id} 색상`}
                    disabled={isSubmitting}
                    onClick={() => setColor(option.id)}
                    className={cn(
                      "size-9 shrink-0 rounded-lg transition-shadow",
                      option.theme.swatch,
                      selected
                        ? "ring-2 ring-offset-2 ring-foreground/80"
                        : "ring-1 ring-transparent hover:ring-foreground/25"
                    )}
                  />
                )
              })}
            </div>
          </div>

          {localError ? (
            <p className="text-sm text-destructive" role="alert">
              {localError}
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            "border-t border-border/60 px-5 py-4",
            previewTheme.previewPanel
          )}
        >
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-lg",
                previewTheme.iconBg
              )}
              aria-hidden
            >
              <Folder
                className={cn("size-[18px]", previewTheme.iconText)}
                strokeWidth={2.25}
              />
            </span>
            <span className="text-[15px] font-medium text-foreground">
              {previewName}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type="button"
            className="min-w-[72px] bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={isSubmitting}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? "만드는 중…" : "만들기"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
