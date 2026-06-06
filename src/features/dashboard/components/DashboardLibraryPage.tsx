"use client"

import { RecentFoldersStrip } from "@/features/dashboard/components/RecentFoldersStrip"
import { MaterialGrid } from "@/features/dashboard/components/MaterialGrid"
import { LibraryToolbar } from "@/features/dashboard/components/LibraryToolbar"
import { useDashboardLibraryContext } from "@/features/dashboard/context/DashboardLibraryContext"

type DashboardLibraryPageProps = {
  userName?: string
}

export const DashboardLibraryPage = ({
  userName = "학습자",
}: DashboardLibraryPageProps) => {
  const library = useDashboardLibraryContext()
  const rawName = userName.replace(/님$/, "").trim()
  const displayName =
    rawName && rawName !== "학습자" && rawName.startsWith("김")
      ? rawName.slice(1)
      : rawName || "민준"

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
          <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-foreground">
            안녕하세요, {displayName}님{" "}
            <span aria-hidden className="inline-block">
              👋
            </span>
          </h1>
          <p className="text-base text-muted-foreground">
            자료 {library.totalCount}개
          </p>
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

        {library.isHome ? (
          <RecentFoldersStrip folders={library.recentFolders} />
        ) : null}

        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <h2 className="text-base font-semibold text-foreground">
              {library.isHome ? "내 라이브러리" : library.folderLabel}
            </h2>
            <span className="text-sm text-muted-foreground">
              {library.totalCount}개 자료
            </span>
          </div>
          <MaterialGrid materials={library.materials} layout={library.viewLayout} />
        </div>
      </div>
    </div>
  )
}
