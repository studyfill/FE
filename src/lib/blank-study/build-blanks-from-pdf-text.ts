import type { ExplanationRange } from "@/types/explanation"
import type { BlankDensity } from "@/types/blank-study"
import { BLANK_DENSITY_COUNTS } from "@/types/blank-study"
import type { MaterialPdfPage } from "@/types/pdf-text"

type BlankTarget = {
  before: string
  answer: string
  after: string
}

type SentenceCandidate = {
  text: string
  pageNumber: number
  blank: BlankTarget
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

const splitSentences = (text: string): string[] =>
  text
    .split(/(?<=[.!?。])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 12)

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

const filterPagesByRange = (
  pages: MaterialPdfPage[],
  range: ExplanationRange,
  currentPage: number
): MaterialPdfPage[] => {
  if (range === "all") return pages
  if (range === "page") {
    const page =
      pages.find((p) => p.pageNumber === currentPage) ?? pages[0]
    return page ? [page] : pages
  }
  return pages.slice(0, Math.max(1, Math.ceil(pages.length * 0.6)))
}

const pickSpread = (
  candidates: SentenceCandidate[],
  count: number
): SentenceCandidate[] => {
  if (candidates.length <= count) return candidates

  const byPage = new Map<number, SentenceCandidate[]>()
  candidates.forEach((candidate) => {
    const list = byPage.get(candidate.pageNumber) ?? []
    list.push(candidate)
    byPage.set(candidate.pageNumber, list)
  })

  const pages = [...byPage.keys()].sort((a, b) => a - b)
  const selected: SentenceCandidate[] = []
  let pageIndex = 0

  while (selected.length < count) {
    const page = pages[pageIndex % pages.length]
    const pool = byPage.get(page)
    if (pool?.length) {
      selected.push(pool.shift()!)
    }
    pageIndex += 1
    if (pageIndex > pages.length * count * 2) break
  }

  return selected.slice(0, count)
}

export type PdfBlankSeed = {
  sourcePage: number
  sentenceBefore: string
  sentenceAfter: string
  answer: string
  hint: string
}

export const buildBlanksFromPdfText = (
  pages: MaterialPdfPage[],
  range: ExplanationRange,
  currentPage: number,
  density: BlankDensity
): PdfBlankSeed[] => {
  const filteredPages = filterPagesByRange(pages, range, currentPage)
  const candidates: SentenceCandidate[] = []

  filteredPages.forEach((page) => {
    splitSentences(page.text).forEach((text) => {
      const blank = pickBlankTarget(text)
      if (!blank) return
      candidates.push({ text, pageNumber: page.pageNumber, blank })
    })
  })

  const targetCount = BLANK_DENSITY_COUNTS[density]
  const selected = pickSpread(candidates, targetCount)

  return selected.map(({ pageNumber, blank }) => ({
    sourcePage: pageNumber,
    sentenceBefore: blank.before,
    sentenceAfter: blank.after,
    answer: blank.answer,
    hint: `PDF p.${pageNumber} 원문: "${blank.before}${blank.answer}${blank.after}"`,
  }))
}
