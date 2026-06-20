import { splitTextAtToken } from "@/lib/blank/tokenize-prose"
import type { BlankItem, BlankPageProse, BlankProseNode } from "@/types/blank"

export type CustomFieldBlankTarget = {
  itemId: string
  field: "sentenceBefore" | "sentenceAfter"
  tokenStart: number
  tokenEnd: number
}

export type CustomTextBlankTarget = {
  pageNumber: number
  nodeIndex: number
  tokenStart: number
  tokenEnd: number
}

export type CustomBlankTarget = CustomFieldBlankTarget | CustomTextBlankTarget

export const isCustomTextBlankTarget = (
  target: CustomBlankTarget
): target is CustomTextBlankTarget =>
  "pageNumber" in target && "nodeIndex" in target

const buildCustomHint = (before: string, word: string, after: string) => {
  const context = `${before}${word}${after}`.trim()
  if (context.length <= 24) return `문맥: ${context}`
  return `문맥: …${context.slice(-24)}`
}

const createCustomBlankItem = (
  base: BlankItem,
  userFileId: string,
  idSuffix: string,
  patch: Pick<BlankItem, "sentenceBefore" | "sentenceAfter" | "answer" | "hint">
): BlankItem => ({
  ...base,
  id: `${userFileId}-custom-${idSuffix}`,
  sentenceBefore: patch.sentenceBefore,
  sentenceAfter: patch.sentenceAfter,
  answer: patch.answer,
  hint: patch.hint,
  status: "pending",
  isTextOnly: undefined,
})

export type ApplyCustomBlankResult = {
  items: BlankItem[]
  newBlankItemId: string
  field: CustomFieldBlankTarget["field"]
}

export const applyCustomBlank = (
  items: BlankItem[],
  userFileId: string,
  target: CustomFieldBlankTarget
): ApplyCustomBlankResult | null => {
  const index = items.findIndex((item) => item.id === target.itemId)
  if (index === -1) return null

  const item = items[index]
  const fieldText = item[target.field]
  const { before, word, after } = splitTextAtToken(
    fieldText,
    target.tokenStart,
    target.tokenEnd
  )

  if (!word.trim()) return null

  const idSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const hint = buildCustomHint(before, word, after)

  if (target.field === "sentenceBefore") {
    const leadingBlank = createCustomBlankItem(item, userFileId, `${idSuffix}-a`, {
      sentenceBefore: before,
      sentenceAfter: "",
      answer: word,
      hint,
    })
    const trailingItem: BlankItem = {
      ...item,
      sentenceBefore: after,
    }

    return {
      items: [
        ...items.slice(0, index),
        leadingBlank,
        trailingItem,
        ...items.slice(index + 1),
      ],
      newBlankItemId: leadingBlank.id,
      field: target.field,
    }
  }

  const leadingItem: BlankItem = {
    ...item,
    sentenceAfter: before,
  }
  const trailingBlank = createCustomBlankItem(item, userFileId, `${idSuffix}-b`, {
    sentenceBefore: "",
    sentenceAfter: after,
    answer: word,
    hint,
  })

  return {
    items: [
      ...items.slice(0, index),
      leadingItem,
      trailingBlank,
      ...items.slice(index + 1),
    ],
    newBlankItemId: trailingBlank.id,
    field: target.field,
  }
}

export const insertBlankNodeIntoPdfPages = (
  pdfPages: BlankPageProse[],
  targetItemId: string,
  newBlankItemId: string,
  field: CustomFieldBlankTarget["field"]
): BlankPageProse[] =>
  pdfPages.map((page) => {
    const nodeIndex = page.nodes.findIndex(
      (node) => node.type === "blank" && node.itemId === targetItemId
    )
    if (nodeIndex === -1) return page

    const newBlankNode: BlankProseNode = {
      type: "blank",
      itemId: newBlankItemId,
    }
    const nodes =
      field === "sentenceBefore"
        ? [
            ...page.nodes.slice(0, nodeIndex),
            newBlankNode,
            ...page.nodes.slice(nodeIndex),
          ]
        : [
            ...page.nodes.slice(0, nodeIndex + 1),
            newBlankNode,
            ...page.nodes.slice(nodeIndex + 1),
          ]

    return { ...page, nodes }
  })

export type ApplyCustomTextBlankResult = {
  pdfPages: BlankPageProse[]
  items: BlankItem[]
  newBlankItemId: string
}

export const applyCustomBlankFromTextNode = (
  pdfPages: BlankPageProse[],
  items: BlankItem[],
  userFileId: string,
  target: CustomTextBlankTarget
): ApplyCustomTextBlankResult | null => {
  const pageIndex = pdfPages.findIndex(
    (page) => page.pageNumber === target.pageNumber
  )
  if (pageIndex === -1) return null

  const page = pdfPages[pageIndex]
  const node = page.nodes[target.nodeIndex]
  if (!node || node.type !== "text") return null

  const { before, word, after } = splitTextAtToken(
    node.content,
    target.tokenStart,
    target.tokenEnd
  )
  if (!word.trim()) return null

  const baseItem =
    items.find((item) => item.sourcePage === target.pageNumber && !item.isTextOnly) ??
    items.find((item) => !item.isTextOnly) ??
    items[0]

  if (!baseItem) return null

  const idSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const hint = buildCustomHint(before, word, after)
  const newBlank = createCustomBlankItem(
    { ...baseItem, sourcePage: target.pageNumber },
    userFileId,
    idSuffix,
    {
      sentenceBefore: before,
      sentenceAfter: after,
      answer: word,
      hint,
    }
  )

  const blankNode: BlankProseNode = { type: "blank", itemId: newBlank.id }
  const updatedNodes = [
    ...page.nodes.slice(0, target.nodeIndex),
    blankNode,
    ...page.nodes.slice(target.nodeIndex + 1),
  ]

  const updatedPages = pdfPages.map((entry, index) =>
    index === pageIndex ? { ...entry, nodes: updatedNodes } : entry
  )

  return {
    pdfPages: updatedPages,
    items: [...items, newBlank],
    newBlankItemId: newBlank.id,
  }
}
