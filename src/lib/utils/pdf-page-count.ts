const scanPdfPageCountFromBytes = (bytes: Uint8Array): number | null => {
  const decodeSize = Math.min(bytes.length, 128_000)
  const start = bytes.length - decodeSize
  const chunk = bytes.subarray(start)
  const text = new TextDecoder("latin1").decode(chunk)

  const countMatches = [...text.matchAll(/\/Count\s+(\d+)/g)]
  if (countMatches.length === 0) return null

  const counts = countMatches
    .map((match) => Number.parseInt(match[1], 10))
    .filter((value) => Number.isFinite(value) && value > 0)

  if (counts.length === 0) return null

  return Math.max(...counts)
}

import { loadPdfJs } from "@/lib/pdf/pdfjs-config"

const getPageCountWithPdfJs = async (bytes: Uint8Array): Promise<number | null> => {
  const pdfjs = await loadPdfJs()

  const loadingTask = pdfjs.getDocument({ data: bytes, useSystemFonts: true })
  const pdf = await loadingTask.promise
  const count = pdf.numPages
  await loadingTask.destroy()

  return count > 0 ? count : null
}

const getPageCountWithPdfLib = async (bytes: Uint8Array): Promise<number | null> => {
  const { PDFDocument } = await import("pdf-lib")
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const count = doc.getPageCount()

  return count > 0 ? count : null
}

export const getPdfPageCountFromFile = async (file: File): Promise<number> => {
  const bytes = new Uint8Array(await file.arrayBuffer())

  const strategies = [
    () => getPageCountWithPdfJs(bytes),
    () => getPageCountWithPdfLib(bytes),
  ]

  for (const strategy of strategies) {
    try {
      const count = await strategy()
      if (count && count > 0) return count
    } catch {
      continue
    }
  }

  const scanned = scanPdfPageCountFromBytes(bytes)
  if (scanned && scanned > 0) return scanned

  return 1
}
