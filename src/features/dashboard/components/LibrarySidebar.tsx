"use client"

import Link from "next/link"
import { useState } from "react"
import { BookOpen, Layers, Plus, Search } from "lucide-react"

import { APP_NAME } from "@/constants"
import { ROUTES } from "@/constants/routes"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { CreateFolderDialog } from "@/features/dashboard/components/CreateFolderDialog"
import { FolderTree } from "@/features/dashboard/components/FolderTree"
import { LibrarySidebarFooter } from "@/features/dashboard/components/LibrarySidebarFooter"
import { cn } from "@/lib/utils"
import type { FolderColorId } from "@/constants/folder-colors"
import type { FolderTreeNode } from "@/types/material"

type LibrarySidebarProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  folderTree: FolderTreeNode[]
  activeFolderId: string | null
  userName?: string
  onCreateFolder: (name: string, color: FolderColorId) => Promise<void>
  isCreatingFolder?: boolean
}

export const LibrarySidebar = ({
  searchQuery,
  onSearchChange,
  folderTree,
  activeFolderId,
  userName,
  onCreateFolder,
  isCreatingFolder = false,
}: LibrarySidebarProps) => {
  const [createFolderOpen, setCreateFolderOpen] = useState(false)

  return (
    <aside className="flex h-full w-sidebar shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar">
      <div className="flex shrink-0 flex-col gap-4 px-4 pb-3 pt-5">
        <Link
          href={ROUTES.dashboard}
          className="flex items-center gap-2.5 px-0.5"
        >
          <span
            className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
            aria-hidden
          >
            <Layers className="size-icon-md" strokeWidth={2.25} />
          </span>
          <span className="text-base font-semibold tracking-tight text-sidebar-foreground">
            {APP_NAME}
          </span>
        </Link>

        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-icon-md -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="자료 · 내용 검색"
            className="h-10 rounded-lg border-sidebar-border bg-background/80 pr-3 pl-10 text-body shadow-none"
            aria-label="자료 검색"
          />
        </div>
      </div>

      <ScrollArea className="h-0 min-h-0 flex-1 overflow-hidden px-2">
        <nav className="px-2 pb-2" aria-label="라이브러리 탐색">
          <Link
            href={ROUTES.dashboard}
            className={cn(
              "mb-3 flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-body transition-colors",
              activeFolderId === null
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
            )}
          >
            <BookOpen className="size-icon-md shrink-0" aria-hidden />
            내 라이브러리
          </Link>

          <div className="mb-2 flex items-center justify-between px-2.5">
            <span className="text-caption font-medium text-muted-foreground">폴더</span>
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
              aria-label="폴더 추가"
              onClick={() => setCreateFolderOpen(true)}
            >
              <Plus className="size-4" />
            </button>
          </div>

          <FolderTree nodes={folderTree} activeFolderId={activeFolderId} />
        </nav>
      </ScrollArea>

      <div className="shrink-0 px-4 pb-4">
        <Separator className="mb-3 bg-sidebar-border" />
        <LibrarySidebarFooter userName={userName} />
      </div>

      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        onCreate={onCreateFolder}
        isSubmitting={isCreatingFolder}
      />
    </aside>
  )
}
