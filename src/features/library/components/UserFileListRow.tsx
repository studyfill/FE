"use client"

import Link from "next/link"
import { useDraggable } from "@dnd-kit/core"
import { FileText } from "lucide-react"

import { ROUTES } from "@/constants/routes"
import {
  userFileDragId,
  type LibraryDragData,
} from "@/features/library/types/dnd"
import { getFolderName } from "@/lib/mocks/folders"
import { formatRelativeTime } from "@/lib/utils/format-relative-time"
import {
  getFolderAccentBorderClassNameForFolderId,
  getFolderSummaryThemeForColor,
  getFolderColorById,
  getFolderTagClassNameForFolderId,
} from "@/lib/utils/folder-theme"
import { cn } from "@/lib/utils"
import type { UserFile } from "@/types/user-file"

type UserFileListRowProps = {
  userFile: UserFile
  hideFolderTag?: boolean
}

const LIBRARY_CHIP_CLASS =
  "inline-flex h-5 max-w-full shrink-0 items-center gap-1 rounded-md px-1.5 text-micro font-medium leading-none"

export const UserFileListRow = ({
  userFile,
  hideFolderTag = false,
}: UserFileListRowProps) => {
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

  const row = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border/80 border-l-[3px] bg-card px-3 py-2 transition-colors",
        getFolderAccentBorderClassNameForFolderId(userFile.folderId),
        canStudy && "hover:bg-muted/30 hover:shadow-sm"
      )}
    >
      <div
        className="relative flex size-10 shrink-0 flex-col justify-center overflow-hidden rounded-md border border-border/55 bg-gradient-to-b from-slate-100 to-slate-200/60 px-1.5 pt-1.5 pb-1"
        aria-hidden
      >
        <div className="relative flex flex-1 flex-col justify-center rounded-sm border border-border/40 bg-white px-1 py-1 shadow-sm">
          <div className="space-y-0.5">
            <div className="h-0.5 w-[70%] rounded-full bg-foreground/15" />
            <div className="h-0.5 w-full rounded-full bg-foreground/10" />
            <div className="h-0.5 w-[55%] rounded-full bg-foreground/8" />
          </div>
          <div className="pointer-events-none absolute top-0 right-0 size-1.5 bg-gradient-to-br from-slate-100 to-slate-300" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-body-sm font-semibold text-foreground">
          {title}
        </h3>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
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
          <span className="text-muted-foreground">
            {userFile.pageCount > 0 ? `${userFile.pageCount}p` : "추출 중"}
          </span>
          {userFile.pageCount > 0 ? (
            <span className="text-muted-foreground">
              {formatRelativeTime(userFile.uploadedAt)}
            </span>
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
        href={ROUTES.study(userFile.id)}
        className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        draggable={false}
      >
        {row}
      </Link>
    </div>
  )
}
