"use client"

import { Loader2, MousePointerClick, RotateCcw, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  BlankProseSection,
  groupBlankItemsBySection,
} from "@/features/blank-study/components/BlankProseSection"
import type { useBlankStudy } from "@/features/blank-study/hooks/useBlankStudy"
import type { BlankStudySession } from "@/types/blank-study"

type BlankStudyResultViewProps = {
  session: BlankStudySession
  blankStudy: ReturnType<typeof useBlankStudy>
  onRegenerate: () => void
  isGenerating: boolean
  extractionReady: boolean
}

const sourceLabel = (source: BlankStudySession["options"]["source"]) =>
  source === "pdf" ? "PDF 원문" : "강의 노트"

export const BlankStudyResultView = ({
  session,
  blankStudy,
  onRegenerate,
  isGenerating,
  extractionReady,
}: BlankStudyResultViewProps) => {
  const {
    items,
    answers,
    completedCount,
    progressPercent,
    handleSubmit,
    setAnswer,
    handleRetryIncorrect,
    customBlankMode,
    setCustomBlankMode,
    handleAddCustomBlank,
  } = blankStudy

  const hasIncorrect = items.some((i) => i.status === "incorrect")
  const sections = groupBlankItemsBySection(items)

  let blankOffset = 0

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-3">
        <p className="text-sm font-medium text-primary">
          빈칸 암기 · {sourceLabel(session.options.source)}
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
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
        <div className="flex items-center gap-3">
          {customBlankMode ? (
            <p className="text-xs text-muted-foreground">
              단어를 클릭하면 빈칸으로 바뀝니다
            </p>
          ) : null}
          <Button
            type="button"
            variant={customBlankMode ? "default" : "outline"}
            size="sm"
            className={cn(
              "ml-auto h-9 shrink-0 rounded-button text-sm",
              customBlankMode && "shadow-sm"
            )}
            onClick={() => setCustomBlankMode((prev) => !prev)}
            aria-pressed={customBlankMode}
          >
            <MousePointerClick className="size-4" />
            직접 빈칸 만들기
          </Button>
        </div>
      </header>

      <article className="flex flex-col gap-6">
        {sections.map((section) => {
          const startIndex = blankOffset
          blankOffset += section.items.length

          return (
            <BlankProseSection
              key={`${section.sectionLabel ?? "default"}-${startIndex}`}
              sectionLabel={section.sectionLabel}
              sourcePage={section.sourcePage}
              items={section.items}
              answers={answers}
              startIndex={startIndex}
              customBlankMode={customBlankMode}
              onAnswerChange={setAnswer}
              onSubmit={handleSubmit}
              onCustomBlank={handleAddCustomBlank}
            />
          )
        })}
      </article>

      {hasIncorrect ? (
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-button"
          onClick={handleRetryIncorrect}
          aria-label="오답 다시 풀기"
        >
          <RotateCcw className="size-icon-md" />
          오답 다시 풀기
        </Button>
      ) : null}

      <p className="text-center text-xs text-muted-foreground">
        {new Date(session.generatedAt).toLocaleString("ko-KR")} 생성
      </p>

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full rounded-button"
        onClick={onRegenerate}
        disabled={isGenerating || !extractionReady}
      >
        {isGenerating ? (
          <Loader2 className="size-icon-md animate-spin" />
        ) : (
          <Sparkles className="size-icon-md" strokeWidth={2} />
        )}
        {isGenerating ? "재생성 중…" : "다시 생성하기"}
      </Button>
    </div>
  )
}
