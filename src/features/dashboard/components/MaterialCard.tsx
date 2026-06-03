"use client"

import Link from "next/link"
import { Folder } from "lucide-react"

import { ROUTES } from "@/constants/routes"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getFolderName } from "@/lib/mocks/folders"
import { formatRelativeTime } from "@/lib/utils/format-relative-time"
import {
  getFolderPreviewBackgroundClassNameForFolderId,
  getFolderTagClassNameForFolderId,
} from "@/lib/utils/folder-theme"
import { cn } from "@/lib/utils"
import type { Material } from "@/types/material"

type MaterialCardProps = {
  material: Material
}

const DocumentPreviewSkeleton = () => (
  <div className="flex w-full flex-col justify-center gap-2">
    <div className="h-1.5 w-[68%] rounded-full bg-foreground/12" />
    <div className="h-1.5 w-full rounded-full bg-foreground/10" />
    <div className="h-1.5 w-[80%] rounded-full bg-foreground/8" />
    <div className="h-1.5 w-[52%] rounded-full bg-foreground/6" />
  </div>
)

export const MaterialCard = ({ material }: MaterialCardProps) => {
  const folderName = getFolderName(material.folderId)
  const previewBackground = getFolderPreviewBackgroundClassNameForFolderId(
    material.folderId
  )
  const folderTagClassName = getFolderTagClassNameForFolderId(material.folderId)
  const canStudy = material.extractionStatus === "done"
  const title = material.name.replace(/\.pdf$/i, "")

  const content = (
    <Card
      className={cn(
        "w-full gap-0 overflow-hidden p-0 py-0 ring-1 ring-foreground/15 transition-all duration-200",
        canStudy &&
          "hover:-translate-y-px hover:shadow-md hover:ring-foreground/22"
      )}
    >
      <div
        className={cn(
          "relative h-[154px] overflow-hidden",
          previewBackground
        )}
      >
        <div
          className="absolute top-4.5 right-4.5 bottom-0 left-4.5 flex flex-col justify-center rounded-t-md border-x border-t border-border/60 bg-white px-4 pt-4 pb-5 shadow-sm"
          aria-hidden
        >
          <DocumentPreviewSkeleton />
        </div>
      </div>

      <Separator className="bg-foreground/12" />

      <div className="space-y-2 bg-card px-5 py-4">
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium",
            folderTagClassName
          )}
        >
          <Folder className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{folderName}</span>
        </div>
        <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold text-foreground">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {material.pageCount > 0 ? `${material.pageCount}p` : "추출 중"}
          {material.pageCount > 0
            ? ` · ${formatRelativeTime(material.uploadedAt)}`
            : ""}
        </p>
      </div>
    </Card>
  )

  if (!canStudy) {
    return <div className="opacity-75">{content}</div>
  }

  return (
    <Link
      href={ROUTES.study(material.id)}
      className="block w-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {content}
    </Link>
  )
}
