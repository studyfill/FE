import { loadPdfJs } from "@/lib/pdf/pdfjs-config"
import type { MaterialPdfPage } from "@/types/pdf-text"

export const extractPdfTextFromBytes = async (
  pdfBytes: ArrayBuffer
): Promise<MaterialPdfPage[]> => {
  const pdfjs = await loadPdfJs()
  const loadingTask = pdfjs.getDocument({
    data: pdfBytes.slice(0),
    useSystemFonts: true,
  })
  const doc = await loadingTask.promise

  const pages: MaterialPdfPage[] = []

  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
    const page = await doc.getPage(pageNumber)
    const content = await page.getTextContent()
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()

    if (text) {
      pages.push({ pageNumber, text })
    }
  }

  await loadingTask.destroy()
  return pages
}
