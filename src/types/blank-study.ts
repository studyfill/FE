import type { ExplanationRange } from "@/types/explanation"

export type BlankItemStatus = "pending" | "correct" | "incorrect"

export type BlankSource = "pdf" | "explanation"

export type BlankDensity = "light" | "normal" | "dense"

export type BlankGenerateOptions = {
  source: BlankSource
  range: ExplanationRange
  density: BlankDensity
}

export const DEFAULT_BLANK_OPTIONS: BlankGenerateOptions = {
  source: "pdf",
  range: "chapter",
  density: "normal",
}

export const BLANK_DENSITY_COUNTS: Record<BlankDensity, number> = {
  light: 5,
  normal: 10,
  dense: 15,
}

export type BlankItem = {
  id: string
  materialId: string
  sectionLabel?: string
  sourcePage?: number
  sentenceBefore: string
  sentenceAfter: string
  answer: string
  hint: string
  status: BlankItemStatus
  isTextOnly?: boolean
}

export type BlankProseNode =
  | { type: "text"; content: string }
  | { type: "blank"; itemId: string }

export type BlankPageProse = {
  pageNumber: number
  nodes: BlankProseNode[]
}

export type BlankStudySession = {
  materialId: string
  generatedAt: string
  options: BlankGenerateOptions
  items: BlankItem[]
  pdfPages?: BlankPageProse[]
}
