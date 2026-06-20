import { Layers } from "lucide-react"

import { NoteGenerateIcon } from "@/features/note/components/NoteGenerateIcon"
import { cn } from "@/lib/utils"

type StudyFeatureTabsPreviewProps = {
  activeTab: "note" | "blank"
}

const tabClassName = (isActive: boolean) =>
  cn(
    "relative -mb-px flex items-center gap-2 py-3.5 text-body",
    isActive
      ? "font-semibold text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.75 after:rounded-full after:bg-primary"
      : "font-medium text-muted-foreground"
  )

export const StudyFeatureTabsPreview = ({
  activeTab,
}: StudyFeatureTabsPreviewProps) => {
  const noteActive = activeTab === "note"
  const blankActive = activeTab === "blank"

  return (
    <nav
      className="flex shrink-0 gap-10 border-b border-border/80 bg-background px-8"
      aria-label="학습 기능 탭 미리보기"
    >
      <div className={tabClassName(noteActive)}>
        <NoteGenerateIcon
          size={18}
          className="size-icon-md text-inherit"
          strokeWidth={noteActive ? 2.25 : 1.75}
        />
        쉽게 설명
      </div>
      <div className={tabClassName(blankActive)}>
        <Layers
          className="size-icon-md text-inherit"
          strokeWidth={blankActive ? 2.25 : 1.75}
        />
        빈칸 암기
      </div>
    </nav>
  )
}
