"use client"

import Link from "next/link"
import { useDraggable } from "@dnd-kit/core"
import { FileText } from "lucide-react"

import { ROUTES } from "@/constants/routes"
import { Card } from "@/components/ui/card"
import {
  userFileDragId,
  type LibraryDragData,
} from "@/features/library/types/dnd"
import { getFolderName } from "@/lib/api/folders"
import { formatRelativeTime } from "@/lib/utils/format-relative-time"
import {
  getFolderAccentBorderClassNameForFolderId,
  getFolderColorById,
  getFolderSummaryThemeForColor,
  getFolderTagClassNameForFolderId,
} from "@/lib/utils/folder-theme"
import { cn } from "@/lib/utils"
import type { UserFile } from "@/types/user-file"

type UserFileCardProps = {
  userFile: UserFile
  hideFolderTag?: boolean
}

const LIBRARY_CHIP_CLASS =
  "inline-flex h-5 max-w-full shrink-0 items-center gap-1 rounded-md px-1.5 text-micro font-medium leading-none"

const DocumentPreviewSkeleton = () => (
  <div className="flex w-full flex-col justify-center gap-1.5">
    <div className="h-1 w-[68%] rounded-full bg-foreground/12" />
    <div className="h-1 w-full rounded-full bg-foreground/10" />
    <div className="h-1 w-[80%] rounded-full bg-foreground/8" />
    <div className="h-1 w-[52%] rounded-full bg-foreground/6" />
  </div>
)

const DocumentSheetPreview = () => (
  <div
    className="relative h-file-thumb overflow-hidden bg-gradient-to-b from-slate-100/90 to-slate-200/45"
    aria-hidden
  >
    <div className="absolute top-3.5 right-5 bottom-0 left-5 flex flex-col justify-center rounded-t-md border-x border-t border-border/55 bg-white px-3 pt-3 pb-4 shadow-md">
      <DocumentPreviewSkeleton />
      <div className="pointer-events-none absolute top-0 right-0 size-4 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 shadow-[inset_1px_1px_0_rgba(255,255,255,0.6)]" />
    </div>
  </div>
)

export const UserFileCard = ({
  userFile,
  hideFolderTag = false,
}: UserFileCardProps) => {
  const folderName = getFolderName(userFile.folderId)
  const folderTagClassName = getFolderTagClassNameForFolderId(userFile.folderId)
  const folderColor = getFolderColorById(userFile.folderId)
  const folderTheme = folderColor ? getFolderSummaryThemeForColor(folderColor) : null
  const canStudy = userFile.extractionStatus === "done"
  const title = userFile.name.replace(/\.pdf$/i, "")

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: userFileDragId(userFile.id),
    data: {
      type: "userFile",
      userFileId: userFile.id,
      label: title,
    } satisfies LibraryDragData,
    disabled: !canStudy,
  })

  const card = (
    <Card
      className={cn(
        "w-full gap-0 overflow-hidden border-l-[3px] p-0 py-0 ring-1 ring-foreground/12 transition-all duration-200",
        getFolderAccentBorderClassNameForFolderId(userFile.folderId),
        canStudy &&
          "hover:-translate-y-px hover:shadow-md hover:ring-foreground/20"
      )}
    >
      <DocumentSheetPreview />

      <div className="space-y-1 border-t border-border/60 bg-card px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(LIBRARY_CHIP_CLASS, "bg-slate-100 text-slate-600")}
          >
            <FileText className="size-3 shrink-0" strokeWidth={2.25} />
            PDF
          </span>
          {!hideFolderTag && folderTheme ? (
            <span
              className={cn(
                LIBRARY_CHIP_CLASS,
                folderTheme.iconBg,
                folderTagClassName
              )}
            >
              <span className="truncate">{folderName}</span>
            </span>
          ) : null}
        </div>
        <h3 className="line-clamp-2 text-body-sm leading-snug font-semibold text-foreground">
          {title}
        </h3>
        <p className="text-micro text-muted-foreground">
          {userFile.pageCount > 0 ? `${userFile.pageCount}p` : "추출 중"}
          {userFile.pageCount > 0
            ? ` · ${formatRelativeTime(userFile.uploadedAt)}`
            : ""}
        </p>
      </div>
    </Card>
  )

  if (!canStudy) {
    return <div className="opacity-75">{card}</div>
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`${title} 이동`}
      className={cn(
        "relative w-full cursor-grab rounded-xl active:cursor-grabbing",
        isDragging && "opacity-40"
      )}
    >
      <Link
        href={ROUTES.study(userFile.id)}
        className="block w-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        draggable={false}
      >
        {card}
      </Link>
    </div>
  )
}
