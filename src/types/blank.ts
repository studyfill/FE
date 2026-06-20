import type { NoteRange } from "@/types/note"

export type BlankItemStatus = "pending" | "correct" | "incorrect"

export type BlankSource = "pdf" | "note"

export type BlankDensity = "light" | "normal" | "dense"

export type BlankGenerateOptions = {
  source: BlankSource
  range: NoteRange
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
  userFileId: string
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

export type BlankSession = {
  userFileId: string
  generatedAt: string
  savedAt?: string | null
  options: BlankGenerateOptions
  items: BlankItem[]
  pdfPages?: BlankPageProse[]
}
