import type { BlankItem, BlankPageProse } from "@/types/blank-study"

export const mergeBlankText = (item: BlankItem): string =>
  `${item.sentenceBefore}${item.answer}${item.sentenceAfter}`

export const removeBlankFromPdfPages = (
  pdfPages: BlankPageProse[],
  itemId: string,
  mergedText: string
): BlankPageProse[] =>
  pdfPages
    .map((page) => {
      const nodes = [...page.nodes]
      const blankIndex = nodes.findIndex(
        (node) => node.type === "blank" && node.itemId === itemId
      )
      if (blankIndex === -1) return page

      const textNode = { type: "text" as const, content: mergedText }
      const prev = nodes[blankIndex - 1]
      const next = nodes[blankIndex + 1]

      if (prev?.type === "text") {
        nodes[blankIndex - 1] = {
          type: "text",
          content: `${prev.content}${mergedText}`,
        }
        nodes.splice(blankIndex, 1)
      } else if (next?.type === "text") {
        nodes[blankIndex + 1] = {
          type: "text",
          content: `${mergedText}${next.content}`,
        }
        nodes.splice(blankIndex, 1)
      } else {
        nodes[blankIndex] = textNode
      }

      return { ...page, nodes }
    })
    .filter((page) => page.nodes.length > 0)

export const replaceBlankWithTextItem = (
  items: BlankItem[],
  itemId: string,
  mergedText: string,
  materialId: string
): BlankItem[] => {
  const index = items.findIndex((item) => item.id === itemId)
  if (index === -1) return items

  const source = items[index]
  const textItem: BlankItem = {
    id: `${materialId}-text-${Date.now()}`,
    materialId,
    sectionLabel: source.sectionLabel,
    sourcePage: source.sourcePage,
    sentenceBefore: mergedText,
    sentenceAfter: "",
    answer: "",
    hint: "",
    status: "correct",
    isTextOnly: true,
  }

  return [
    ...items.slice(0, index),
    textItem,
    ...items.slice(index + 1),
  ]
}
