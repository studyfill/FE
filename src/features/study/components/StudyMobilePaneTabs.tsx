"use client"

import { cn } from "@/lib/utils"

export type StudyMobilePane = "pdf" | "panel"

type StudyMobilePaneTabsProps = {
  activePane: StudyMobilePane
  onPaneChange: (pane: StudyMobilePane) => void
}

export const StudyMobilePaneTabs = ({
  activePane,
  onPaneChange,
}: StudyMobilePaneTabsProps) => {
  const tabs: { id: StudyMobilePane; label: string }[] = [
    { id: "pdf", label: "PDF" },
    { id: "panel", label: "학습" },
  ]

  return (
    <div
      className="flex shrink-0 border-b border-border bg-background px-4 lg:hidden"
      role="tablist"
      aria-label="학습 화면 전환"
    >
      {tabs.map((tab) => {
        const isActive = activePane === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cn(
              "relative -mb-px flex-1 py-3 text-body-sm font-medium transition-colors",
              isActive
                ? "text-primary after:absolute after:inset-x-4 after:bottom-0 after:h-0.75 after:rounded-full after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onPaneChange(tab.id)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
