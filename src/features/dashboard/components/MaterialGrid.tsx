import { FileText } from "lucide-react"

import { FolderCard } from "@/features/dashboard/components/FolderCard"
import { FolderListRow } from "@/features/dashboard/components/FolderListRow"
import { MaterialCard } from "@/features/dashboard/components/MaterialCard"
import { MaterialListRow } from "@/features/dashboard/components/MaterialListRow"
import type { FolderGridItem } from "@/lib/mocks/folders"
import type { Material, MaterialViewLayout } from "@/types/material"

type MaterialGridProps = {
  folders?: FolderGridItem[]
  materials: Material[]
  layout?: MaterialViewLayout
  hideMaterialFolderTag?: boolean
}

const LibraryEmptyState = () => (
  <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 text-center">
    <FileText className="mb-3 size-10 text-muted-foreground/40" aria-hidden />
    <p className="text-sm font-medium text-foreground/80">
      표시할 폴더나 PDF가 없습니다
    </p>
    <p className="mt-1 text-xs text-muted-foreground">
      폴더를 만들거나 상단 업로드 버튼으로 학습 자료를 추가하세요
    </p>
  </div>
)

export const MaterialGrid = ({
  folders = [],
  materials,
  layout = "grid",
  hideMaterialFolderTag = false,
}: MaterialGridProps) => {
  const isEmpty = folders.length === 0 && materials.length === 0

  if (isEmpty) {
    return <LibraryEmptyState />
  }

  if (layout === "list") {
    return (
      <ul className="flex flex-col gap-3">
        {folders.map((folder) => (
          <li key={folder.id} className="min-w-0">
            <FolderListRow folder={folder} />
          </li>
        ))}
        {materials.map((material) => (
          <li key={material.id} className="min-w-0">
            <MaterialListRow
              material={material}
              hideFolderTag={hideMaterialFolderTag}
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {folders.map((folder) => (
        <li key={folder.id} className="min-w-0">
          <FolderCard folder={folder} />
        </li>
      ))}
      {materials.map((material) => (
        <li key={material.id} className="min-w-0">
          <MaterialCard
            material={material}
            hideFolderTag={hideMaterialFolderTag}
          />
        </li>
      ))}
    </ul>
  )
}
