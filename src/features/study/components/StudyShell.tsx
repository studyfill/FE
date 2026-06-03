"use client"

import Link from "next/link"

import { StudyTabs } from "@/components/layout/StudyTabs"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import { useMaterial } from "@/features/pdf/hooks/useMaterial"
import { StudyWorkspaceHeader } from "@/features/study/components/StudyWorkspaceHeader"

type StudyShellProps = {
  materialId: string
  children: React.ReactNode
}

export const StudyShell = ({ materialId, children }: StudyShellProps) => {
  const { material, isLoading, setPage } = useMaterial(materialId)

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">자료를 불러오는 중…</p>
    )
  }

  if (!material) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">자료를 찾을 수 없습니다.</p>
        <Link href={ROUTES.materials}>
          <Button type="button" variant="outline" size="sm">
            자료 관리로 돌아가기
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <StudyWorkspaceHeader material={material} />
        <Link href={ROUTES.materials}>
          <Button type="button" variant="outline" size="sm">
            자료 목록
          </Button>
        </Link>
      </div>
      <StudyTabs materialId={materialId} />
      {children}
    </div>
  )
}
