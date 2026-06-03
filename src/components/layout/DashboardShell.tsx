"use client"

import type { ReactNode } from "react"

import { LibrarySidebar } from "@/features/dashboard/components/LibrarySidebar"
import {
  DashboardLibraryProvider,
  useDashboardLibraryContext,
} from "@/features/dashboard/context/DashboardLibraryContext"

type DashboardShellProps = {
  children: ReactNode
  folderId: string | null
  userName?: string
}

const DashboardShellInner = ({
  children,
  folderId,
  userName,
}: DashboardShellProps) => {
  const library = useDashboardLibraryContext()

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-background">
      <LibrarySidebar
        searchQuery={library.searchQuery}
        onSearchChange={library.setSearchQuery}
        folderTree={library.folderTree}
        activeFolderId={folderId}
        userName={userName}
      />
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-8 py-7 lg:px-10">
        {children}
      </main>
    </div>
  )
}

export const DashboardShell = ({
  children,
  folderId,
  userName,
}: DashboardShellProps) => {
  return (
    <DashboardLibraryProvider folderId={folderId}>
      <DashboardShellInner folderId={folderId} userName={userName}>
        {children}
      </DashboardShellInner>
    </DashboardLibraryProvider>
  )
}
