"use client"

import Link from "next/link"
import { Folder } from "lucide-react"

import { ROUTES } from "@/constants/routes"
import { Card } from "@/components/ui/card"
import { FolderActionsMenu } from "@/features/library/components/FolderActionsMenu"
import {
  getFolderAccentBorderClassNameForColor,
  getFolderIconClassNameForColor,
} from "@/lib/utils/folder-theme"
import { cn } from "@/lib/utils"
import type { FolderListItem } from "@/types/user-file"

type FolderCardProps = {
  folder: FolderListItem
}

const FolderIconPreview = ({ color }: { color: FolderListItem["color"] }) => {
  const iconClass = getFolderIconClassNameForColor(color)

  return (
    <div
      className="relative flex h-file-thumb items-end justify-center overflow-hidden bg-muted/20 pb-6"
      aria-hidden
    >
      <Folder
        className={cn("size-10 fill-current/20", iconClass)}
        strokeWidth={1.5}
      />
    </div>
  )
}

export const FolderCard = ({ folder }: FolderCardProps) => {
  return (
    <div className="group relative w-full">
      <Link
        href={ROUTES.libraryFolder(folder.id)}
        className="block w-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Card
          className={cn(
            "w-full gap-0 overflow-hidden border-l-[3px] p-0 py-0 ring-1 ring-foreground/12 transition-all duration-200",
            getFolderAccentBorderClassNameForColor(folder.color),
            "hover:-translate-y-px hover:shadow-md hover:ring-foreground/20"
          )}
        >
          <FolderIconPreview color={folder.color} />

          <div className="space-y-1 border-t border-border/60 bg-card px-4 py-2.5">
            <div className="inline-flex items-center gap-1 rounded-md bg-muted/70 px-1.5 py-0.5 text-micro font-medium text-muted-foreground">
              <Folder className="size-3 shrink-0" strokeWidth={2.25} />
              폴더
            </div>
            <h3 className="line-clamp-2 text-body-sm leading-snug font-semibold text-foreground">
              {folder.name}
            </h3>
            <p className="text-micro text-muted-foreground">
              {folder.fileCount}개 자료
            </p>
          </div>
        </Card>
      </Link>

      <div className="absolute top-2 right-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <FolderActionsMenu
          folder={folder}
          className="bg-card/80 shadow-sm ring-1 ring-border/60 backdrop-blur-sm"
        />
      </div>
    </div>
  )
}
