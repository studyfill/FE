"use client"

import {
  BlankProseSection,
  groupBlankItemsBySection,
} from "@/features/blank-study/components/BlankProseSection"
import { LandingBrowserFrame } from "@/features/landing/components/mockups/LandingBrowserFrame"
import { StaticPdfPane } from "@/features/landing/components/mockups/StaticPdfPane"
import { StudyFeatureTabsPreview } from "@/features/landing/components/mockups/StudyFeatureTabsPreview"
import { StudySplitLayout } from "@/features/study/components/StudySplitLayout"
import type { BlankStudySession } from "@/types/blank-study"
import type { MaterialPdfPage } from "@/types/pdf-text"

type LandingBlankStudyMockProps = {
  session: BlankStudySession
  pdfPages: MaterialPdfPage[]
}

export const LandingBlankStudyMock = ({
  session,
  pdfPages,
}: LandingBlankStudyMockProps) => {
  const items = session.items
  const completedCount = items.filter((i) => i.status !== "pending").length
  const progressPercent =
    items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0
  const sections = groupBlankItemsBySection(items)

  let blankOffset = 0

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
              <StudyFeatureTabsPreview activeTab="blank-study" />
              <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
                <header className="shrink-0 space-y-3">
                  <p className="text-body-sm font-medium text-primary">
                    빈칸 암기 · PDF 원문
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-caption text-muted-foreground">
                      <span>
                        진행 {completedCount}/{items.length}
                      </span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-valuenow={progressPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </header>

                <article className="flex flex-col gap-5">
                  {sections.map((group) => {
                    const section = (
                      <BlankProseSection
                        key={
                          group.sectionLabel ??
                          String(group.sourcePage ?? blankOffset)
                        }
                        sectionLabel={group.sectionLabel}
                        sourcePage={group.sourcePage}
                        items={group.items}
                        answers={{}}
                        startIndex={blankOffset}
                        customBlankMode={false}
                        onAnswerChange={() => {}}
                        onSubmit={() => {}}
                        onCustomBlank={() => {}}
                      />
                    )
                    blankOffset += group.items.length
                    return section
                  })}
                </article>
              </div>
            </div>
          }
          />
        </div>
      </div>
    </LandingBrowserFrame>
  )
}
