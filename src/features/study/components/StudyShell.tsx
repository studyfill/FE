"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import { PdfViewer } from "@/features/pdf/components/PdfViewer"
import { useMaterial } from "@/features/pdf/hooks/useMaterial"
import { StudyBreadcrumbs } from "@/features/study/components/StudyBreadcrumbs"
import { StudyFeatureTabs } from "@/features/study/components/StudyFeatureTabs"
import { StudySplitLayout } from "@/features/study/components/StudySplitLayout"
import {
  StudyWorkspaceProvider,
  useStudyWorkspace,
} from "@/features/study/context/StudyWorkspaceContext"

type StudyShellProps = {
  materialId: string
  children: React.ReactNode
}

const StudyPdfPane = () => {
  const { material, setPage, highlightPage } = useStudyWorkspace()

  return (
    <PdfViewer
      material={material}
      onPageChange={setPage}
      highlightPage={highlightPage}
    />
  )
}

export const StudyShell = ({ materialId, children }: StudyShellProps) => {
  const { material, isLoading, setPage } = useMaterial(materialId)

  if (isLoading) {
    return (
      <p className="px-4 py-6 text-sm text-muted-foreground">
        자료를 불러오는 중…
      </p>
    )
  }

  if (!material) {
    return (
      <div className="space-y-4 px-4 py-6">
        <p className="text-sm text-destructive">자료를 찾을 수 없습니다.</p>
        <Link href={ROUTES.dashboard}>
          <Button type="button" variant="outline" size="sm">
            내 라이브러리로 돌아가기
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <StudyWorkspaceProvider
      materialId={materialId}
      material={material}
      setPage={setPage}
    >
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 items-center border-b border-border px-4 py-3">
          <StudyBreadcrumbs material={material} />
        </header>

        <StudySplitLayout
          left={<StudyPdfPane />}
          right={
            <>
              <StudyFeatureTabs materialId={materialId} />
              <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            </>
          }
        />
      </div>
    </StudyWorkspaceProvider>
  )
}
