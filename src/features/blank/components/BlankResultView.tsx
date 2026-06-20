"use client"

import { Loader2, MousePointerClick, RotateCcw, Save, Sparkles } from "lucide-react"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BlankPdfProseView } from "@/features/blank/components/BlankPdfProseView"
import {
  BlankProseSection,
  groupBlankItemsBySection,
} from "@/features/blank/components/BlankProseSection"
import type { useBlank } from "@/features/blank/hooks/useBlank"
import type { BlankSession } from "@/types/blank"

type BlankResultViewProps = {
  session: BlankSession
  blank: ReturnType<typeof useBlank>
  onRegenerate: () => void
  isGenerating: boolean
  extractionReady: boolean
}

const sourceLabel = (source: BlankSession["options"]["source"]) =>
  source === "pdf" ? "PDF 원문" : "강의 노트"

export const BlankResultView = ({
  session,
  blank,
  onRegenerate,
  isGenerating,
  extractionReady,
}: BlankResultViewProps) => {
  const {
    items,
    allItems,
    answers,
    completedCount,
    progressPercent,
    handleSubmit,
    setAnswer,
    handleRetryIncorrect,
    customBlankMode,
    setCustomBlankMode,
    handleAddCustomBlank,
    handleRemoveBlank,
    handleSaveSession,
    isDirty,
    saveMessage,
  } = blank

  const hasIncorrect = items.some((i) => i.status === "incorrect")
  const sections = groupBlankItemsBySection(allItems)
  const itemsById = useMemo(
    () => new Map(session.items.map((item) => [item.id, item])),
    [session.items]
  )
  const usePdfProse =
    session.options.source === "pdf" &&
    session.pdfPages &&
    session.pdfPages.length > 0

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

      {usePdfProse ? (
        <BlankPdfProseView
          pdfPages={session.pdfPages!}
          itemsById={itemsById}
          answers={answers}
          customBlankMode={customBlankMode}
          onAnswerChange={setAnswer}
          onSubmit={handleSubmit}
          onCustomBlank={handleAddCustomBlank}
          onRemoveBlank={handleRemoveBlank}
        />
      ) : (
        <article className="flex flex-col gap-6">
          {sections.map((section) => {
            const startIndex = blankOffset
            section.items.forEach((item) => {
              if (!item.isTextOnly) blankOffset += 1
            })

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
                onRemoveBlank={handleRemoveBlank}
              />
            )
          })}
        </article>
      )}

      <div className="space-y-2">
        <Button
          type="button"
          variant={isDirty ? "default" : "outline"}
          className="h-11 w-full rounded-button"
          onClick={handleSaveSession}
          disabled={!isDirty}
          aria-label="빈칸 세션 저장"
        >
          <Save className="size-icon-md" />
          {isDirty ? "변경사항 저장" : "저장됨"}
        </Button>
        {saveMessage ? (
          <p className="text-center text-xs text-primary" role="status">
            {saveMessage}
          </p>
        ) : null}
      </div>

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
