"use client"

import Link from "next/link"
import { Folder } from "lucide-react"

import { ROUTES } from "@/constants/routes"
import { getFolderIconClassNameForColor } from "@/lib/utils/folder-theme"
import { cn } from "@/lib/utils"
import type { RecentFolderItem } from "@/lib/mocks/recent-folders"

type RecentFoldersStripProps = {
  folders: RecentFolderItem[]
}

export const RecentFoldersStrip = ({ folders }: RecentFoldersStripProps) => {
  if (folders.length === 0) return null

  return (
    <section aria-label="최근 사용한 폴더">
      <h2 className="mb-3 text-caption font-medium text-muted-foreground">
        최근 사용한 폴더
      </h2>
      <div className="-mx-1 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:thin]">
        <ul className="flex w-max gap-3 px-1">
          {folders.map((folder) => (
            <li key={folder.id} className="w-folder-strip shrink-0 snap-start">
              <Link
                href={ROUTES.libraryFolder(folder.id)}
                className="flex items-center gap-3 rounded-xl border border-border/80 bg-card px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md"
              >
                <Folder
                  className={cn(
                    "size-5 shrink-0 fill-none",
                    getFolderIconClassNameForColor(folder.color)
                  )}
                  strokeWidth={2.25}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block truncate text-body font-semibold text-foreground">
                    {folder.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {folder.fileCount}개 자료
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
