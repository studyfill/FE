"use client"

import { ExplanationMockPreview } from "@/features/landing/components/mockups/ExplanationMockPreview"
import { LandingBrowserFrame } from "@/features/landing/components/mockups/LandingBrowserFrame"
import { StaticPdfPane } from "@/features/landing/components/mockups/StaticPdfPane"
import { StudyFeatureTabsPreview } from "@/features/landing/components/mockups/StudyFeatureTabsPreview"
import { StudySplitLayout } from "@/features/study/components/StudySplitLayout"
import type { LectureExplanation } from "@/types/explanation"
import type { MaterialPdfPage } from "@/types/pdf-text"

type LandingExplanationMockProps = {
  explanation: LectureExplanation
  pdfPages: MaterialPdfPage[]
}

export const LandingExplanationMock = ({
  explanation,
  pdfPages,
}: LandingExplanationMockProps) => {
  return (
    <LandingBrowserFrame>
      <div className="flex h-[42rem] w-full flex-col bg-background">
        <header className="flex shrink-0 items-center border-b border-border/60 px-5 py-2.5">
          <p className="truncate text-caption text-muted-foreground">
            내 라이브러리
            <span className="mx-1.5 text-border">›</span>
            <span className="text-foreground/80">자료구조</span>
            <span className="mx-1.5 text-border">›</span>
            <span className="font-medium text-foreground">
              트리와 이진탐색트리
            </span>
          </p>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">
          <StudySplitLayout
          left={<StaticPdfPane pages={pdfPages} />}
          right={
            <div className="flex min-h-0 flex-1 flex-col">
              <StudyFeatureTabsPreview activeTab="explanation" />
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                <ExplanationMockPreview data={explanation} />
              </div>
            </div>
          }
          />
        </div>
      </div>
    </LandingBrowserFrame>
  )
}
