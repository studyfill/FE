import { splitTextAtToken } from "@/lib/blank-study/tokenize-prose"
import type { BlankItem } from "@/types/blank-study"

export type CustomBlankTarget = {
  itemId: string
  field: "sentenceBefore" | "sentenceAfter"
  tokenStart: number
  tokenEnd: number
}

const buildCustomHint = (before: string, word: string, after: string) => {
  const context = `${before}${word}${after}`.trim()
  if (context.length <= 24) return `문맥: ${context}`
  return `문맥: …${context.slice(-24)}`
}

const createCustomBlankItem = (
  base: BlankItem,
  materialId: string,
  idSuffix: string,
  patch: Pick<BlankItem, "sentenceBefore" | "sentenceAfter" | "answer" | "hint">
): BlankItem => ({
  ...base,
  id: `${materialId}-custom-${idSuffix}`,
  sentenceBefore: patch.sentenceBefore,
  sentenceAfter: patch.sentenceAfter,
  answer: patch.answer,
  hint: patch.hint,
  status: "pending",
})

export const applyCustomBlank = (
  items: BlankItem[],
  materialId: string,
  target: CustomBlankTarget
): BlankItem[] => {
  const index = items.findIndex((item) => item.id === target.itemId)
  if (index === -1) return items

  const item = items[index]
  const fieldText = item[target.field]
  const { before, word, after } = splitTextAtToken(
    fieldText,
    target.tokenStart,
    target.tokenEnd
  )

  if (!word.trim()) return items

  const idSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const hint = buildCustomHint(before, word, after)

  if (target.field === "sentenceBefore") {
    const leadingBlank = createCustomBlankItem(item, materialId, `${idSuffix}-a`, {
      sentenceBefore: before,
      sentenceAfter: "",
      answer: word,
      hint,
    })
    const trailingItem: BlankItem = {
      ...item,
      sentenceBefore: after,
    }

    return [
      ...items.slice(0, index),
      leadingBlank,
      trailingItem,
      ...items.slice(index + 1),
    ]
  }

  const leadingItem: BlankItem = {
    ...item,
    sentenceAfter: before,
  }
  const trailingBlank = createCustomBlankItem(item, materialId, `${idSuffix}-b`, {
    sentenceBefore: "",
    sentenceAfter: after,
    answer: word,
    hint,
  })

  return [
    ...items.slice(0, index),
    leadingItem,
    trailingBlank,
    ...items.slice(index + 1),
  ]
}
