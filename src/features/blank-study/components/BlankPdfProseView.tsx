"use client"

import { Fragment, useMemo } from "react"

import { BlankSelectableText } from "@/features/blank-study/components/BlankSelectableText"
import {
  BlankInlineBlank,
} from "@/features/blank-study/components/BlankProseSection"
import type { CustomBlankTarget } from "@/lib/blank-study/add-custom-blank"
import type { BlankItem, BlankPageProse } from "@/types/blank-study"

type BlankPdfProseViewProps = {
  pdfPages: BlankPageProse[]
  itemsById: Map<string, BlankItem>
  answers: Record<string, string>
  customBlankMode: boolean
  blankIndexOffset?: number
  onAnswerChange: (itemId: string, value: string) => void
  onSubmit: (itemId: string) => void
  onCustomBlank: (target: CustomBlankTarget) => void
  onRemoveBlank?: (itemId: string) => void
}

export const BlankPdfProseView = ({
  pdfPages,
  itemsById,
  answers,
  customBlankMode,
  blankIndexOffset = 0,
  onAnswerChange,
  onSubmit,
  onCustomBlank,
  onRemoveBlank,
}: BlankPdfProseViewProps) => {
  const blankOrder = useMemo(() => {
    const order = new Map<string, number>()
    let index = blankIndexOffset
    pdfPages.forEach((page) => {
      page.nodes.forEach((node) => {
        if (node.type === "blank") {
          order.set(node.itemId, index)
          index += 1
        }
      })
    })
    return order
  }, [blankIndexOffset, pdfPages])

  return (
    <article className="flex flex-col gap-6">
      {pdfPages.map((page) => (
        <section key={page.pageNumber} className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">
            PDF p.{page.pageNumber}
          </h3>
          <div className="text-body leading-[1.9] text-foreground/90">
            {page.nodes.map((node, nodeIndex) => {
              if (node.type === "text") {
                return (
                  <BlankSelectableText
                    key={`text-${page.pageNumber}-${nodeIndex}`}
                    text={node.content}
                    enabled={customBlankMode}
                    onWordClick={(tokenStart, tokenEnd) =>
                      onCustomBlank({
                        pageNumber: page.pageNumber,
                        nodeIndex,
                        tokenStart,
                        tokenEnd,
                      })
                    }
                  />
                )
              }

              const item = itemsById.get(node.itemId)
              if (!item) return null

              const blankIndex = blankOrder.get(node.itemId) ?? 0

              return (
                <Fragment key={node.itemId}>
                  <BlankInlineBlank
                    item={item}
                    blankIndex={blankIndex}
                    answer={answers[node.itemId] ?? ""}
                    customBlankMode={customBlankMode}
                    onAnswerChange={(value) => onAnswerChange(node.itemId, value)}
                    onSubmit={() => onSubmit(node.itemId)}
                    onCustomBlank={(target) =>
                      onCustomBlank({ ...target, itemId: node.itemId })
                    }
                    onRemoveBlank={onRemoveBlank}
                  />
                </Fragment>
              )
            })}
          </div>
        </section>
      ))}
    </article>
  )
}
