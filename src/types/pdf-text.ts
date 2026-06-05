export type MaterialPdfPage = {
  pageNumber: number
  text: string
}

export type MaterialPdfText = {
  materialId: string
  extractedAt: string
  pages: MaterialPdfPage[]
}
