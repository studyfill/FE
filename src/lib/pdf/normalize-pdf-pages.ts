import type { UserFilePdfPage } from "@/types/pdf-text"

export const normalizePdfPages = (
  pages: UserFilePdfPage[],
  pageCount?: number
): UserFilePdfPage[] => {
  if (!pages.length) return []

  const sorted = [...pages].sort((a, b) => a.pageNumber - b.pageNumber)
  const cap =
    pageCount && pageCount > 0
      ? Math.min(pageCount, sorted.length)
      : sorted.length

  return sorted.slice(0, cap).map((page, index) => ({
    pageNumber: index + 1,
    text: page.text,
  }))
}
