"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import { PdfViewer } from "@/features/pdf/components/PdfViewer"
import { updateUserFileLastStudied } from "@/lib/mocks/user-files"
import { useUserFile } from "@/features/pdf/hooks/useUserFile"
import { StudyBreadcrumbs } from "@/features/study/components/StudyBreadcrumbs"
import { StudyFeatureTabs } from "@/features/study/components/StudyFeatureTabs"
import {
  StudyMobilePaneTabs,
  type StudyMobilePane,
} from "@/features/study/components/StudyMobilePaneTabs"
import { StudySplitLayout } from "@/features/study/components/StudySplitLayout"
import { useStudyLayoutMode } from "@/features/study/hooks/useStudyLayoutMode"
import {
  StudyWorkspaceProvider,
  useStudyWorkspace,
} from "@/features/study/context/StudyWorkspaceContext"

type StudyShellProps = {
  userFileId: string
  children: React.ReactNode
}

const StudyPdfPane = () => {
  const { userFile, setPage, highlightPage } = useStudyWorkspace()

  return (
    <PdfViewer
      userFile={userFile}
      onPageChange={setPage}
      highlightPage={highlightPage}
    />
  )
}

export const StudyShell = ({ userFileId, children }: StudyShellProps) => {
  const { userFile, isLoading, setPage } = useUserFile(userFileId)
  const layoutMode = useStudyLayoutMode()
  const [activePane, setActivePane] = useState<StudyMobilePane>("panel")

  useEffect(() => {
    if (userFile) {
      updateUserFileLastStudied(userFileId)
    }
  }, [userFileId, userFile])

  if (isLoading) {
    return (
      <p className="px-4 py-6 text-sm text-muted-foreground">
        자료를 불러오는 중…
      </p>
    )
  }

  if (!userFile) {
    return (
      <div className="space-y-4 px-4 py-6">
        <p className="text-sm text-destructive">자료를 찾을 수 없습니다.</p>
        <Link href={ROUTES.library}>
          <Button type="button" variant="outline" size="sm">
            내 라이브러리로 돌아가기
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <StudyWorkspaceProvider
      userFileId={userFileId}
      userFile={userFile}
      setPage={setPage}
    >
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 items-center border-b border-border px-4 py-3">
          <StudyBreadcrumbs userFile={userFile} />
        </header>

        {layoutMode === "stacked" ? (
          <StudyMobilePaneTabs
            activePane={activePane}
            onPaneChange={setActivePane}
          />
        ) : null}

        <StudySplitLayout
          layoutMode={layoutMode}
          activePane={activePane}
          left={<StudyPdfPane />}
          right={
            <>
              <StudyFeatureTabs userFileId={userFileId} />
              <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            </>
          }
        />
      </div>
    </StudyWorkspaceProvider>
  )
}
