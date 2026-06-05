"use client"

import { Lightbulb } from "lucide-react"
import { Fragment, useState } from "react"

import { BlankSelectableText } from "@/features/blank-study/components/BlankSelectableText"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { CustomBlankTarget } from "@/lib/blank-study/add-custom-blank"
import type { BlankItem } from "@/types/blank-study"

type BlankInlineBlankProps = {
  item: BlankItem
  blankIndex: number
  answer: string
  customBlankMode: boolean
  onAnswerChange: (value: string) => void
  onSubmit: () => void
  onCustomBlank: (target: Omit<CustomBlankTarget, "itemId">) => void
}

export const BlankInlineBlank = ({
  item,
  blankIndex,
  answer,
  customBlankMode,
  onAnswerChange,
  onSubmit,
  onCustomBlank,
}: BlankInlineBlankProps) => {
  const [hintVisible, setHintVisible] = useState(false)

  const handleToggleHint = () => {
    setHintVisible((prev) => !prev)
  }

  const handleBeforeWordClick = (tokenStart: number, tokenEnd: number) => {
    onCustomBlank({ field: "sentenceBefore", tokenStart, tokenEnd })
  }

  const handleAfterWordClick = (tokenStart: number, tokenEnd: number) => {
    onCustomBlank({ field: "sentenceAfter", tokenStart, tokenEnd })
  }

  return (
    <>
      <BlankSelectableText
        text={item.sentenceBefore}
        enabled={customBlankMode}
        onWordClick={handleBeforeWordClick}
      />
      <span className="mx-0.5 inline-flex items-center gap-1 align-baseline">
        {item.status !== "pending" ? (
          <span
            className={cn(
              "inline-block rounded px-1.5 py-0.5 text-[15px] leading-normal font-medium",
              item.status === "correct"
                ? "bg-primary/15 text-primary ring-1 ring-primary/25"
                : "bg-destructive/10 text-destructive ring-1 ring-destructive/20"
            )}
            role="status"
          >
            {item.status === "incorrect" ? item.answer : answer || item.answer}
          </span>
        ) : (
          <>
            <Input
              className="inline-flex h-7 w-auto min-w-[5rem] max-w-[9rem] px-1.5 py-0 text-sm leading-normal"
              style={{
                width: `${Math.max(5, Math.min(9, item.answer.length + 2))}rem`,
              }}
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && answer.trim()) {
                  onSubmit()
                }
              }}
              aria-label={`빈칸 ${blankIndex + 1} 답 입력`}
            />
            <button
              type="button"
              className={cn(
                "inline-flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors",
                hintVisible
                  ? "border-amber-300 bg-amber-100 text-amber-700 shadow-sm"
                  : "border-amber-200/90 bg-amber-50 text-amber-600 hover:border-amber-300 hover:bg-amber-100 hover:text-amber-700"
              )}
              aria-label={`빈칸 ${blankIndex + 1} 힌트`}
              aria-pressed={hintVisible}
              onClick={handleToggleHint}
            >
              <Lightbulb className="size-4 fill-current" strokeWidth={2} />
            </button>
          </>
        )}
      </span>

      {hintVisible && item.status === "pending" ? (
        <span
          className="my-1 flex w-full items-center gap-1.5 rounded border border-amber-200/90 bg-amber-50 px-2 py-1 text-xs leading-tight text-amber-950"
          role="note"
        >
          <Lightbulb className="size-3 shrink-0 text-amber-600" strokeWidth={2} />
          <span>{item.hint}</span>
        </span>
      ) : null}

      <BlankSelectableText
        text={item.sentenceAfter}
        enabled={customBlankMode}
        onWordClick={handleAfterWordClick}
      />
    </>
  )
}

type BlankProseSectionProps = {
  sectionLabel?: string
  sourcePage?: number
  items: BlankItem[]
  answers: Record<string, string>
  startIndex: number
  customBlankMode: boolean
  onAnswerChange: (itemId: string, value: string) => void
  onSubmit: (itemId: string) => void
  onCustomBlank: (target: CustomBlankTarget) => void
}

export const BlankProseSection = ({
  sectionLabel,
  sourcePage,
  items,
  answers,
  startIndex,
  customBlankMode,
  onAnswerChange,
  onSubmit,
  onCustomBlank,
}: BlankProseSectionProps) => (
  <section className="space-y-2">
    {sectionLabel ? (
      <h3 className="text-sm font-semibold text-foreground">
        {sectionLabel}
        {sourcePage ? (
          <span className="ml-1.5 text-xs font-normal text-primary/80">
            p.{sourcePage}
          </span>
        ) : null}
      </h3>
    ) : sourcePage ? (
      <h3 className="text-xs font-medium text-muted-foreground">
        PDF p.{sourcePage}
      </h3>
    ) : null}

    <div className="text-[15px] leading-[1.9] text-foreground/90">
      {items.map((item, index) => (
        <Fragment key={item.id}>
          <BlankInlineBlank
            item={item}
            blankIndex={startIndex + index}
            answer={answers[item.id] ?? ""}
            customBlankMode={customBlankMode}
            onAnswerChange={(value) => onAnswerChange(item.id, value)}
            onSubmit={() => onSubmit(item.id)}
            onCustomBlank={(target) =>
              onCustomBlank({ ...target, itemId: item.id })
            }
          />
          {index < items.length - 1 ? " " : null}
        </Fragment>
      ))}
    </div>
  </section>
)

export type BlankSectionGroup = {
  sectionLabel?: string
  sourcePage?: number
  items: BlankItem[]
}

export const groupBlankItemsBySection = (items: BlankItem[]): BlankSectionGroup[] => {
  const groups: BlankSectionGroup[] = []

  items.forEach((item) => {
    const last = groups[groups.length - 1]
    if (
      last &&
      last.sectionLabel === item.sectionLabel &&
      last.sourcePage === item.sourcePage
    ) {
      last.items.push(item)
    } else {
      groups.push({
        sectionLabel: item.sectionLabel,
        sourcePage: item.sourcePage,
        items: [item],
      })
    }
  })

  return groups
}
