export type ExtractionStatus = "pending" | "processing" | "done" | "failed"

export type Material = {
  id: string
  name: string
  folderId: string
  uploadedAt: string
  extractionStatus: ExtractionStatus
  pageCount: number
  currentPage: number
  progressPercent: number
  lastStudiedAt: string | null
}

export type Folder = {
  id: string
  name: string
}
