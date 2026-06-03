"use client"

import type { Material } from "@/types/material"

type StudyWorkspaceHeaderProps = {
  material: Material
}

export const StudyWorkspaceHeader = ({ material }: StudyWorkspaceHeaderProps) => {
  return (
    <div className="space-y-1">
      <h1 className="text-lg font-semibold tracking-tight">{material.name}</h1>
      <p className="text-sm text-muted-foreground">
        학습 진도 {material.progressPercent}%
        {material.pageCount > 0 ? ` · ${material.pageCount}페이지` : ""}
      </p>
    </div>
  )
}
