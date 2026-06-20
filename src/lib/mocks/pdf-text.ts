import { normalizePdfPages } from "@/lib/pdf/normalize-pdf-pages"
import { extractPdfTextFromBytes } from "@/lib/pdf/extract-pdf-text"
import { getPdfBlob } from "@/lib/storage/pdf-blob-store"
import type { UserFile } from "@/types/user-file"
import type { UserFilePdfText } from "@/types/pdf-text"

import { getSeedPdfText } from "./pdf-text-seeds"
import { loadMockStore, saveMockStore } from "./mock-store"

export const saveUserFilePdfText = (data: UserFilePdfText) => {
  const store = loadMockStore()
  store.pdfTexts[data.userFileId] = data
  saveMockStore(store)
}

export const getUserFilePdfText = (userFile: UserFile): UserFilePdfText | null => {
  const store = loadMockStore()
  const stored = store.pdfTexts[userFile.id]
  const raw = stored?.pages.length ? stored : getSeedPdfText(userFile)
  if (!raw?.pages.length) return null

  return {
    ...raw,
    pages: normalizePdfPages(raw.pages, userFile.pageCount),
  }
}

export const ensureUserFilePdfText = async (
  userFile: UserFile
): Promise<UserFilePdfText> => {
  const existing = getUserFilePdfText(userFile)
  if (existing?.pages.length) return existing

  const blob = await getPdfBlob(userFile.id)
  if (!blob) {
    const seed = getSeedPdfText(userFile)
    if (seed) {
      saveUserFilePdfText(seed)
      return seed
    }
    throw new Error("PDF 원문 텍스트를 찾을 수 없습니다.")
  }

  const pages = normalizePdfPages(
    await extractPdfTextFromBytes(blob),
    userFile.pageCount
  )
  if (!pages.length) {
    const seed = getSeedPdfText(userFile)
    if (seed) {
      saveUserFilePdfText(seed)
      return seed
    }
    throw new Error("PDF에서 텍스트를 추출하지 못했습니다.")
  }

  const extracted: UserFilePdfText = {
    userFileId: userFile.id,
    extractedAt: new Date().toISOString(),
    pages,
  }
  saveUserFilePdfText(extracted)
  return extracted
}
