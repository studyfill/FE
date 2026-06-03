import { FileText } from "lucide-react"

import { MaterialCard } from "@/features/dashboard/components/MaterialCard"
import type { Material } from "@/types/material"

type MaterialGridProps = {
  materials: Material[]
}

export const MaterialGrid = ({ materials }: MaterialGridProps) => {
  if (materials.length === 0) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 text-center">
        <FileText className="mb-3 size-10 text-muted-foreground/40" aria-hidden />
        <p className="text-sm font-medium text-foreground/80">
          이 폴더에 표시할 PDF가 없습니다
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          상단 업로드 버튼으로 학습 자료를 추가하세요
        </p>
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {materials.map((material) => (
        <li key={material.id} className="min-w-0">
          <MaterialCard material={material} />
        </li>
      ))}
    </ul>
  )
}
