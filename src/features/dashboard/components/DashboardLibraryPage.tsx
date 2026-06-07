"use client"

import { useState } from "react"
import { FolderPlus } from "lucide-react"

import { RecentFoldersStrip } from "@/features/dashboard/components/RecentFoldersStrip"
import { MaterialGrid } from "@/features/dashboard/components/MaterialGrid"
import { LibraryToolbar } from "@/features/dashboard/components/LibraryToolbar"
import { CreateFolderDialog } from "@/features/dashboard/components/CreateFolderDialog"
import { Button } from "@/components/ui/button"
import { useDashboardLibraryContext } from "@/features/dashboard/context/DashboardLibraryContext"

type DashboardLibraryPageProps = {
  userName?: string
}

export const DashboardLibraryPage = ({
  userName = "학습자",
}: DashboardLibraryPageProps) => {
  const library = useDashboardLibraryContext()
  const [subfolderDialogOpen, setSubfolderDialogOpen] = useState(false)
  const rawName = userName.replace(/님$/, "").trim()
  const displayName =
    rawName && rawName !== "학습자" && rawName.startsWith("김")
      ? rawName.slice(1)
      : rawName || "민준"

  const librarySummary =
    [
      library.folderCount > 0 ? `폴더 ${library.folderCount}개` : null,
      library.totalCount > 0 ? `자료 ${library.totalCount}개` : null,
    ]
      .filter(Boolean)
      .join(" · ") || "항목 없음"

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <LibraryToolbar
        folderPath={library.folderPath}
        sort={library.sort}
        viewLayout={library.viewLayout}
        onSortChange={library.setSort}
        onViewLayoutChange={library.setViewLayout}
        onUpload={library.handleUpload}
        isUploading={library.isUploading}
      />

      <div className="flex flex-1 flex-col gap-5">
        <div className="space-y-1.5">
          <h1 className="text-title-xl leading-tight font-semibold tracking-tight text-foreground">
            안녕하세요, {displayName}님{" "}
            <span aria-hidden className="inline-block">
              👋
            </span>
          </h1>
          <p className="text-base text-muted-foreground">{librarySummary}</p>
        </div>

        {library.uploadError ? (
          <p className="text-sm text-destructive" role="alert">
            {library.uploadError}
          </p>
        ) : null}

        {library.moveError ? (
          <p className="text-sm text-destructive" role="alert">
            {library.moveError}
          </p>
        ) : null}

        {library.createFolderError ? (
          <p className="text-sm text-destructive" role="alert">
            {library.createFolderError}
          </p>
        ) : null}

        {library.isHome ? (
          <RecentFoldersStrip folders={library.recentFolders} />
        ) : null}

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">
              {library.isHome ? "내 라이브러리" : library.folderLabel}
            </h2>
            <span className="text-sm text-muted-foreground">{librarySummary}</span>
            {!library.isHome ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="ml-auto h-9 rounded-button text-sm"
                onClick={() => setSubfolderDialogOpen(true)}
              >
                <FolderPlus className="size-4" />
                새 하위 폴더
              </Button>
            ) : null}
          </div>
          <MaterialGrid
            folders={library.childFolders}
            materials={library.materials}
            layout={library.viewLayout}
            hideMaterialFolderTag={!library.isHome}
          />
        </div>
      </div>

      {!library.isHome ? (
        <CreateFolderDialog
          open={subfolderDialogOpen}
          onOpenChange={setSubfolderDialogOpen}
          parentFolderName={library.folderLabel}
          isSubmitting={library.isCreatingFolder}
          onCreate={(name, color) =>
            library.handleCreateFolder(name, color, library.folderPath.at(-1)?.id ?? null)
          }
        />
      ) : null}
    </div>
  )
}
