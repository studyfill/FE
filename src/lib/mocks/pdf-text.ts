import { extractPdfTextFromBytes } from "@/lib/pdf/extract-pdf-text"
import { getPdfBlob } from "@/lib/storage/pdf-blob-store"
import type { Material } from "@/types/material"
import type { MaterialPdfText } from "@/types/pdf-text"

import { getSeedPdfText } from "./pdf-text-seeds"
import { loadMockStore, saveMockStore } from "./mock-store"

export const saveMaterialPdfText = (data: MaterialPdfText) => {
  const store = loadMockStore()
  store.pdfTexts[data.materialId] = data
  saveMockStore(store)
}

export const getMaterialPdfText = (material: Material): MaterialPdfText | null => {
  const store = loadMockStore()
  const stored = store.pdfTexts[material.id]
  if (stored?.pages.length) return stored

  return getSeedPdfText(material)
}

export const ensureMaterialPdfText = async (
  material: Material
): Promise<MaterialPdfText> => {
  const existing = getMaterialPdfText(material)
  if (existing?.pages.length) return existing

  const blob = await getPdfBlob(material.id)
  if (!blob) {
    const seed = getSeedPdfText(material)
    if (seed) {
      saveMaterialPdfText(seed)
      return seed
    }
    throw new Error("PDF 원문 텍스트를 찾을 수 없습니다.")
  }

  const pages = await extractPdfTextFromBytes(blob)
  if (!pages.length) {
    const seed = getSeedPdfText(material)
    if (seed) {
      saveMaterialPdfText(seed)
      return seed
    }
    throw new Error("PDF에서 텍스트를 추출하지 못했습니다.")
  }

  const extracted: MaterialPdfText = {
    materialId: material.id,
    extractedAt: new Date().toISOString(),
    pages,
  }
  saveMaterialPdfText(extracted)
  return extracted
}
