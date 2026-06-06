"use client"

import Link from "next/link"
import { useDraggable } from "@dnd-kit/core"
import { FileText, Folder } from "lucide-react"

import { ROUTES } from "@/constants/routes"
import {
  materialDragId,
  type LibraryDragData,
} from "@/features/dashboard/types/dnd"
import { getFolderName } from "@/lib/mocks/folders"
import { formatRelativeTime } from "@/lib/utils/format-relative-time"
import {
  getFolderPreviewBackgroundClassNameForFolderId,
  getFolderTagClassNameForFolderId,
} from "@/lib/utils/folder-theme"
import { cn } from "@/lib/utils"
import type { Material } from "@/types/material"

type MaterialListRowProps = {
  material: Material
}

export const MaterialListRow = ({ material }: MaterialListRowProps) => {
  const folderName = getFolderName(material.folderId)
  const previewBackground = getFolderPreviewBackgroundClassNameForFolderId(
    material.folderId
  )
  const folderTagClassName = getFolderTagClassNameForFolderId(material.folderId)
  const canStudy = material.extractionStatus === "done"
  const title = material.name.replace(/\.pdf$/i, "")

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: materialDragId(material.id),
    data: {
      type: "material",
      materialId: material.id,
      label: title,
    } satisfies LibraryDragData,
    disabled: !canStudy,
  })

  const row = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border/80 bg-card px-3 py-2.5 transition-colors",
        canStudy && "hover:bg-muted/30 hover:shadow-sm"
      )}
    >
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-md border border-border/60",
          previewBackground
        )}
        aria-hidden
      >
        <FileText className="size-4 text-foreground/45" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-body font-semibold text-foreground">
          {title}
        </h3>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span
            className={cn(
              "inline-flex items-center gap-1 font-medium",
              folderTagClassName
            )}
          >
            <Folder className="size-3 shrink-0" aria-hidden />
            {folderName}
          </span>
          <span>
            {material.pageCount > 0 ? `${material.pageCount}p` : "추출 중"}
          </span>
          {material.pageCount > 0 ? (
            <span>{formatRelativeTime(material.uploadedAt)}</span>
          ) : null}
        </div>
      </div>
    </div>
  )

  if (!canStudy) {
    return <div className="opacity-75">{row}</div>
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`${title} 이동`}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40"
      )}
    >
      <Link
        href={ROUTES.study(material.id)}
        className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        draggable={false}
      >
        {row}
      </Link>
    </div>
  )
}
