"use client"

import Link from "next/link"
import { Star } from "lucide-react"

import { ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"
import type { FolderListItem } from "@/types/user-file"

type FavoriteFolderListProps = {
  folders: FolderListItem[]
  activeFolderId: string | null
}

export const FavoriteFolderList = ({
  folders,
  activeFolderId,
}: FavoriteFolderListProps) => {
  return (
    <ul className="flex flex-col gap-0.5">
      {folders.map((folder) => {
        const isActive = activeFolderId === folder.id
        return (
          <li key={folder.id}>
            <Link
              href={ROUTES.libraryFolder(folder.id)}
              className={cn(
                "flex min-w-0 items-center gap-2 rounded-lg px-2.5 py-2 text-body transition-colors",
                isActive
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
              )}
            >
              <Star
                className="size-4 shrink-0 fill-amber-400 text-amber-500"
                aria-hidden
              />
              <span className="truncate">{folder.name}</span>
              <span className="ml-auto shrink-0 text-caption tabular-nums text-muted-foreground">
                {folder.fileCount}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
