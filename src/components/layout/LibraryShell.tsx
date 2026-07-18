"use client"

import type { ReactNode } from "react"

import { LibrarySidebar } from "@/features/library/components/LibrarySidebar"
import { LibraryDndProvider } from "@/features/library/components/LibraryDndProvider"
import {
  LibraryProvider,
  useLibraryContext,
} from "@/features/library/context/LibraryContext"

type LibraryShellProps = {
  children: ReactNode
  folderId: string | null
  userName?: string
}

const LibraryShellInner = ({
  children,
  folderId,
  userName,
}: LibraryShellProps) => {
  const library = useLibraryContext()

  return (
    <LibraryDndProvider>
      <div className="flex h-full min-h-0 w-full overflow-hidden bg-background">
        <LibrarySidebar
          searchQuery={library.searchQuery}
          onSearchChange={library.setSearchQuery}
          folderTree={library.folderTree}
          favoriteFolders={library.favoriteFolders}
          activeFolderId={folderId}
          userName={userName}
          onCreateFolder={library.handleCreateFolder}
          isCreatingFolder={library.isCreatingFolder}
        />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-8 py-7 lg:px-10">
          {children}
        </main>
      </div>
    </LibraryDndProvider>
  )
}

export const LibraryShell = ({
  children,
  folderId,
  userName,
}: LibraryShellProps) => {
  return (
    <LibraryProvider folderId={folderId}>
      <LibraryShellInner folderId={folderId} userName={userName}>
        {children}
      </LibraryShellInner>
    </LibraryProvider>
  )
}
