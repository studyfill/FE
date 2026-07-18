import type { BlankDensity, BlankRange } from "@/types/blank"
import { BLANK_DENSITY_COUNTS } from "@/types/blank"
import type { UserFilePdfPage } from "@/types/pdf-text"

type BlankTarget = {
  before: string
  answer: string
  after: string
}

type SentenceSpan = {
  start: number
  end: number
  text: string
}

export type PdfBlankSeed = {
  sourcePage: number
  sentenceBefore: string
  sentenceAfter: string
  answer: string
  hint: string
}

export type PdfProseDraftNode =
  | { type: "text"; content: string }
  | { type: "blank"; seed: PdfBlankSeed }

export type PdfProseDraftPage = {
  pageNumber: number
  nodes: PdfProseDraftNode[]
}

type BlankCandidate = {
  key: string
  pageNumber: number
  answerStart: number
  answerEnd: number
  answer: string
  hint: string
}

const STOPWORDS = new Set([
  "이",
  "그",
  "저",
  "것",
  "수",
  "등",
  "및",
  "the",
  "and",
  "or",
  "is",
  "are",
  "of",
  "to",
  "in",
  "a",
  "an",
])

const MIN_SENTENCE_LENGTH = 12

const scoreToken = (token: string): number => {
  let score = token.length
  if (/\d/.test(token)) score += 4
  if (/[A-Z]/.test(token)) score += 2
  if (/[()]/.test(token)) score += 2
  if (/O\(/.test(token)) score += 5
  return score
}

const pickBlankTarget = (sentence: string): BlankTarget | null => {
  const pattern = /[A-Za-z0-9][A-Za-z0-9()\-+⌊⌋₂]*|[가-힣]{2,}/g
  const matches = [...sentence.matchAll(pattern)]

  let best: { token: string; index: number; score: number } | null = null

  for (const match of matches) {
    const token = match[0]
    if (STOPWORDS.has(token.toLowerCase())) continue
    if (token.length < 2) continue

    const score = scoreToken(token)
    if (!best || score > best.score) {
      best = { token, index: match.index ?? 0, score }
    }
  }

  if (!best) return null

  const before = sentence.slice(0, best.index)
  const after = sentence.slice(best.index + best.token.length)

  if (!before.trim() || !after.trim()) return null

  return {
    before,
    answer: best.token,
    after,
  }
}

const findSentenceSpans = (fullText: string): SentenceSpan[] => {
  const trimmed = fullText.trim()
  if (!trimmed) return []

  const spans: SentenceSpan[] = []
  const regex = /[^.!?。]+(?:[.!?。])?/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(fullText)) !== null) {
    const raw = match[0]
    const text = raw.trim()
    if (!text) continue

    const start = match.index + raw.indexOf(text)
    spans.push({ start, end: start + text.length, text })
  }

  if (spans.length === 0) {
    const start = fullText.indexOf(trimmed)
    spans.push({ start, end: start + trimmed.length, text: trimmed })
  }

  return spans
}

const filterPagesByRange = (
  pages: UserFilePdfPage[],
  range: BlankRange,
  currentPage: number
): UserFilePdfPage[] => {
  if (range === "all") return pages
  if (range === "page") {
    const page =
      pages.find((p) => p.pageNumber === currentPage) ?? pages[0]
    return page ? [page] : pages
  }
  return pages.slice(0, Math.max(1, Math.ceil(pages.length * 0.6)))
}

const selectBlankKeys = (
  candidatesByPage: Map<number, BlankCandidate[]>,
  targetCount: number
): Set<string> => {
  const selected = new Set<string>()
  const pageNumbers = [...candidatesByPage.keys()].sort((a, b) => a - b)

  let remaining = targetCount

  for (let pageIdx = 0; pageIdx < pageNumbers.length; pageIdx += 1) {
    if (remaining <= 0) break

    const pageNumber = pageNumbers[pageIdx]
    const candidates = candidatesByPage.get(pageNumber) ?? []
    if (candidates.length === 0) continue

    const pagesLeft = pageNumbers.length - pageIdx
    const take = Math.min(
      remaining,
      Math.max(1, Math.ceil(remaining / pagesLeft)),
      candidates.length
    )

    for (let i = 0; i < take; i += 1) {
      selected.add(candidates[i].key)
      remaining -= 1
    }
  }

  return selected
}

const buildPageNodes = (
  fullText: string,
  blanks: BlankCandidate[]
): PdfProseDraftNode[] => {
  if (blanks.length === 0) {
    return fullText ? [{ type: "text", content: fullText }] : []
  }

  const sorted = [...blanks].sort((a, b) => a.answerStart - b.answerStart)
  const nodes: PdfProseDraftNode[] = []
  let cursor = 0

  for (const blank of sorted) {
    if (blank.answerStart < cursor) continue

    if (blank.answerStart > cursor) {
      nodes.push({
        type: "text",
        content: fullText.slice(cursor, blank.answerStart),
      })
    }

    nodes.push({
      type: "blank",
      seed: {
        sourcePage: blank.pageNumber,
        sentenceBefore: "",
        sentenceAfter: "",
        answer: blank.answer,
        hint: blank.hint,
      },
    })

    cursor = blank.answerEnd
  }

  if (cursor < fullText.length) {
    nodes.push({ type: "text", content: fullText.slice(cursor) })
  }

  return nodes
}

export const buildBlanksFromPdfText = (
  pages: UserFilePdfPage[],
  range: BlankRange,
  currentPage: number,
  density: BlankDensity
): PdfProseDraftPage[] => {
  const filteredPages = filterPagesByRange(pages, range, currentPage).sort(
    (a, b) => a.pageNumber - b.pageNumber
  )

  const candidatesByPage = new Map<number, BlankCandidate[]>()

  filteredPages.forEach((page) => {
    const pageCandidates: BlankCandidate[] = []

    findSentenceSpans(page.text).forEach((span, index) => {
      if (span.text.length < MIN_SENTENCE_LENGTH) return

      const blank = pickBlankTarget(span.text)
      if (!blank) return

      pageCandidates.push({
        key: `${page.pageNumber}:${index}`,
        pageNumber: page.pageNumber,
        answerStart: span.start + blank.before.length,
        answerEnd: span.start + blank.before.length + blank.answer.length,
        answer: blank.answer,
        hint: `PDF p.${page.pageNumber} 원문: "${span.text}"`,
      })
    })

    if (pageCandidates.length > 0) {
      candidatesByPage.set(page.pageNumber, pageCandidates)
    }
  })

  const targetCount = BLANK_DENSITY_COUNTS[density]
  const selectedKeys = selectBlankKeys(candidatesByPage, targetCount)

  return filteredPages.map((page) => {
    const pageBlanks =
      candidatesByPage
        .get(page.pageNumber)
        ?.filter((candidate) => selectedKeys.has(candidate.key)) ?? []

    return {
      pageNumber: page.pageNumber,
      nodes: buildPageNodes(page.text, pageBlanks),
    }
  })
}
