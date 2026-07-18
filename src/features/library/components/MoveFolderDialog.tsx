"use client"

import { Folder, Home, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"

import { Button } from "@/components/ui/button"
import { useLibraryContext } from "@/features/library/context/LibraryContext"
import { getFolderIconClassNameForColor } from "@/lib/utils/folder-theme"
import { getDescendantFolderIds } from "@/lib/utils/folder-tree"
import { cn } from "@/lib/utils"
import type { FolderListItem, FolderTreeNode } from "@/types/user-file"

type MoveFolderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  folder: FolderListItem
}

type FlatFolder = {
  id: string
  name: string
  parentId: string | null
  color: FolderTreeNode["color"]
  depth: number
}

const flattenTree = (nodes: FolderTreeNode[], depth = 0): FlatFolder[] =>
  nodes.flatMap((node) => [
    {
      id: node.id,
      name: node.name,
      parentId: node.parentId,
      color: node.color,
      depth,
    },
    ...flattenTree(node.children, depth + 1),
  ])

export const MoveFolderDialog = ({
  open,
  onOpenChange,
  folder,
}: MoveFolderDialogProps) => {
  const { folderTree, handleMoveFolder } = useLibraryContext()
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) {
      setLocalError(null)
      setIsSubmitting(false)
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

  const destinations = useMemo(() => {
    const flat = flattenTree(folderTree)
    const blocked = new Set([
      folder.id,
      ...getDescendantFolderIds(folder.id, flat),
    ])
    return flat.filter((f) => !blocked.has(f.id) && f.id !== folder.parentId)
  }, [folderTree, folder.id, folder.parentId])

  const handleMove = async (targetId: string | null) => {
    setIsSubmitting(true)
    setLocalError(null)
    try {
      await handleMoveFolder(folder.id, targetId)
      onOpenChange(false)
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "폴더를 이동하지 못했습니다."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted || !open) return null

  const canMoveToRoot = folder.parentId !== null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="폴더 이동 창 닫기"
        onClick={() => !isSubmitting && onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="move-folder-title"
        className="relative z-10 flex max-h-[80vh] w-full max-w-dialog-sm flex-col overflow-hidden rounded-xl bg-card shadow-xl ring-1 ring-border/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <h2
            id="move-folder-title"
            className="text-lg font-semibold text-foreground"
          >
            <span className="font-bold">{folder.name}</span> 이동
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

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
          <p className="px-2 pb-2 text-caption text-muted-foreground">
            이동할 위치를 선택하세요.
          </p>
          <ul className="flex flex-col gap-0.5">
            {canMoveToRoot ? (
              <li>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void handleMove(null)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-body text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Home className="size-4 shrink-0" />
                  최상위 (내 라이브러리)
                </button>
              </li>
            ) : null}
            {destinations.map((dest) => (
              <li key={dest.id}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void handleMove(dest.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-body text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  style={{ paddingLeft: 10 + dest.depth * 14 }}
                >
                  <Folder
                    className={cn(
                      "size-4 shrink-0",
                      getFolderIconClassNameForColor(dest.color)
                    )}
                  />
                  <span className="truncate">{dest.name}</span>
                </button>
              </li>
            ))}
            {destinations.length === 0 && !canMoveToRoot ? (
              <li className="px-2.5 py-6 text-center text-caption text-muted-foreground">
                이동할 수 있는 다른 폴더가 없습니다.
              </li>
            ) : null}
          </ul>
        </div>

        {localError ? (
          <p className="px-5 py-2 text-sm text-destructive" role="alert">
            {localError}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            취소
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
