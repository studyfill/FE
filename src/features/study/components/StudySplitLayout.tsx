"use client"

import type { ReactNode } from "react"

import { Separator } from "@/components/ui/separator"

import type { StudyLayoutMode } from "@/features/study/hooks/useStudyLayoutMode"
import type { StudyMobilePane } from "@/features/study/components/StudyMobilePaneTabs"

type StudySplitLayoutProps = {
  left: ReactNode
  right: ReactNode
  layoutMode?: StudyLayoutMode
  activePane?: StudyMobilePane
}

export const StudySplitLayout = ({
  left,
  right,
  layoutMode = "split",
  activePane = "panel",
}: StudySplitLayoutProps) => {
  const isStacked = layoutMode === "stacked"

  return (
    <div
      className={
        isStacked
          ? "flex min-h-0 flex-1 flex-col overflow-hidden"
          : "flex min-h-0 flex-1 overflow-hidden"
      }
    >
      <section
        className={
          isStacked
            ? activePane === "pdf"
              ? "flex min-h-0 min-w-0 flex-1 flex-col"
              : "hidden"
            : "flex min-h-0 min-w-0 flex-[1.15] flex-col border-r border-border"
        }
        aria-label="PDF 뷰어"
      >
        {left}
      </section>
      <Separator orientation="vertical" className="hidden" />
      <section
        className={
          isStacked
            ? activePane === "panel"
              ? "flex min-h-0 min-w-0 flex-1 flex-col"
              : "hidden"
            : "flex min-h-0 min-w-0 flex-1 flex-col"
        }
        aria-label="학습 기능"
      >
        {right}
      </section>
    </div>
  )
}
