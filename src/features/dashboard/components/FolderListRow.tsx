"use client"

import Link from "next/link"
import { Folder } from "lucide-react"

import { ROUTES } from "@/constants/routes"
import {
  getFolderAccentBorderClassNameForColor,
  getFolderIconClassNameForColor,
} from "@/lib/utils/folder-theme"
import { cn } from "@/lib/utils"
import type { FolderGridItem } from "@/lib/mocks/folders"

type FolderListRowProps = {
  folder: FolderGridItem
}

export const FolderListRow = ({ folder }: FolderListRowProps) => {
  const iconClass = getFolderIconClassNameForColor(folder.color)

  return (
    <Link
      href={ROUTES.dashboardFolder(folder.id)}
      className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border border-border/80 border-l-[3px] bg-card px-3 py-2 transition-colors hover:bg-muted/30 hover:shadow-sm",
          getFolderAccentBorderClassNameForColor(folder.color)
        )}
      >
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border/50 bg-muted/20"
          aria-hidden
        >
          <Folder
            className={cn("size-5 fill-current/20", iconClass)}
            strokeWidth={1.75}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-body-sm font-semibold text-foreground">
            {folder.name}
          </h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-micro">
            <span className="inline-flex items-center gap-1 rounded bg-muted/70 px-1 py-0.5 font-medium text-muted-foreground">
              <Folder className="size-2.5 shrink-0" strokeWidth={2.5} />
              폴더
            </span>
            <span className="text-muted-foreground">
              {folder.materialCount}개 자료
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
