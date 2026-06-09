"use client"

import { Lightbulb, X } from "lucide-react"
import { Fragment, useState } from "react"

import { BlankSelectableText } from "@/features/blank-study/components/BlankSelectableText"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { CustomFieldBlankTarget } from "@/lib/blank-study/add-custom-blank"
import type { BlankItem } from "@/types/blank-study"

type BlankInlineBlankProps = {
  item: BlankItem
  blankIndex: number
  answer: string
  customBlankMode: boolean
  onAnswerChange: (value: string) => void
  onSubmit: () => void
  onCustomBlank: (target: Omit<CustomFieldBlankTarget, "itemId">) => void
  onRemoveBlank?: (itemId: string) => void
}

export const BlankInlineBlank = ({
  item,
  blankIndex,
  answer,
  customBlankMode,
  onAnswerChange,
  onSubmit,
  onCustomBlank,
  onRemoveBlank,
}: BlankInlineBlankProps) => {
  const [hintVisible, setHintVisible] = useState(false)

  const handleShowHint = () => setHintVisible(true)
  const handleHideHint = () => setHintVisible(false)

  if (item.isTextOnly) {
    return (
      <span>{item.sentenceBefore}</span>
    )
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
      <span className="relative mx-0.5 inline-flex items-baseline align-baseline">
        {item.status !== "pending" ? (
          <span
            className={cn(
              "inline-block rounded px-1 py-0.5 text-body-sm leading-normal font-medium",
              item.status === "correct"
                ? "bg-primary/15 text-primary ring-1 ring-primary/25"
                : "bg-destructive/10 text-destructive ring-1 ring-destructive/20"
            )}
            role="status"
          >
            {item.status === "incorrect" ? item.answer : answer || item.answer}
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-0.5 align-baseline"
            onMouseEnter={handleShowHint}
            onMouseLeave={handleHideHint}
            onFocus={handleShowHint}
            onBlur={handleHideHint}
          >
            <Input
              className="inline-flex h-6 w-auto min-w-[4rem] max-w-[8rem] px-1.5 py-0 text-body-sm leading-normal"
              style={{
                width: `${Math.max(4, Math.min(8, item.answer.length + 1.5))}rem`,
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
            <span className="inline-flex shrink-0 items-center gap-px align-middle">
              <span
                className={cn(
                  "inline-flex size-5 items-center justify-center rounded text-amber-600/80",
                  hintVisible && "bg-amber-100 text-amber-700"
                )}
                aria-label={`빈칸 ${blankIndex + 1} 힌트`}
                title="힌트"
              >
                <Lightbulb className="size-3 fill-current" strokeWidth={2} />
              </span>
              {onRemoveBlank ? (
                <button
                  type="button"
                  className="inline-flex size-5 items-center justify-center rounded text-muted-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`빈칸 ${blankIndex + 1} 삭제`}
                  title="빈칸 삭제"
                  onClick={() => onRemoveBlank(item.id)}
                >
                  <X className="size-3" strokeWidth={2.5} />
                </button>
              ) : null}
            </span>
            {hintVisible ? (
              <span
                className="absolute top-full left-0 z-20 mt-1 max-w-[14rem] rounded-md border border-amber-200/90 bg-amber-50 px-2 py-1 text-micro leading-snug text-amber-950 shadow-sm"
                role="tooltip"
              >
                {item.hint}
              </span>
            ) : null}
          </span>
        )}
      </span>

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
  onCustomBlank: (target: CustomFieldBlankTarget) => void
  onRemoveBlank?: (itemId: string) => void
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
  onRemoveBlank,
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

    <div className="text-body leading-[1.9] text-foreground/90">
      {items.map((item, index) => {
        const blankIndex =
          startIndex +
          items.slice(0, index).filter((entry) => !entry.isTextOnly).length

        return (
        <Fragment key={item.id}>
          <BlankInlineBlank
            item={item}
            blankIndex={blankIndex}
            answer={answers[item.id] ?? ""}
            customBlankMode={customBlankMode}
            onAnswerChange={(value) => onAnswerChange(item.id, value)}
            onSubmit={() => onSubmit(item.id)}
            onCustomBlank={(target) =>
              onCustomBlank({ ...target, itemId: item.id })
            }
            onRemoveBlank={onRemoveBlank}
          />
          {index < items.length - 1 ? " " : null}
        </Fragment>
        )
      })}
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
