"use client"

import { DndContext } from "@dnd-kit/core"

import { LibrarySidebar } from "@/features/library/components/LibrarySidebar"
import { LibraryToolbar } from "@/features/library/components/LibraryToolbar"
import { UserFileGrid } from "@/features/library/components/UserFileGrid"
import { RecentFoldersStrip } from "@/features/library/components/RecentFoldersStrip"
import { LandingBrowserFrame } from "@/features/landing/components/mockups/LandingBrowserFrame"
import { useClientMounted } from "@/features/landing/hooks/useClientMounted"
import type { RecentFolderItem } from "@/lib/mocks/recent-folders"
import type { FolderTreeNode, UserFile } from "@/types/user-file"

type LandingDashboardMockProps = {
  folderTree: FolderTreeNode[]
  userFiles: UserFile[]
  recentFolders: RecentFolderItem[]
  totalCount: number
}

const DashboardMockPlaceholder = () => (
  <LandingBrowserFrame>
    <div
      className="flex h-[42rem] w-full bg-landing-surface"
      aria-hidden
    />
  </LandingBrowserFrame>
)

export const LandingDashboardMock = ({
  folderTree,
  userFiles,
  recentFolders,
  totalCount,
}: LandingDashboardMockProps) => {
  const mounted = useClientMounted()

  if (!mounted) {
    return <DashboardMockPlaceholder />
  }

  return (
    <LandingBrowserFrame>
      <DndContext id="landing-dashboard-mock">
        <div className="flex h-[42rem] w-full bg-background">
          <LibrarySidebar
            searchQuery=""
            onSearchChange={() => {}}
            folderTree={folderTree}
            activeFolderId={null}
            userName="김민준"
            onCreateFolder={async () => {}}
          />
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-5 py-4">
            <LibraryToolbar
              folderPath={[]}
              sort="recent"
              viewLayout="grid"
              onSortChange={() => {}}
              onViewLayoutChange={() => {}}
              onUpload={async () => {}}
              isUploading={false}
            />

            <div className="mt-4 flex flex-col gap-4">
              <div className="space-y-1">
                <h2 className="text-title-xl font-semibold tracking-tight text-foreground">
                  안녕하세요, 민준님{" "}
                  <span aria-hidden className="inline-block">
                    👋
                  </span>
                </h2>
                <p className="text-body-sm text-muted-foreground">
                  자료 {totalCount}개
                </p>
              </div>

              <RecentFoldersStrip folders={recentFolders.slice(0, 4)} />

              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-body font-semibold text-foreground">
                    내 라이브러리
                  </h3>
                  <span className="text-caption text-muted-foreground">
                    {Math.min(userFiles.length, 6)}개 자료
                  </span>
                </div>
                <UserFileGrid userFiles={userFiles.slice(0, 4)} layout="grid" />
              </div>
            </div>
          </main>
        </div>
      </DndContext>
    </LandingBrowserFrame>
  )
}
