export type ExtractionStatus = "pending" | "processing" | "done" | "failed"

export type Material = {
  id: string
  name: string
  folderId: string | null
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
  parentId: string | null
  pinned?: boolean
}

export type FolderTreeNode = Folder & {
  children: FolderTreeNode[]
  materialCount: number
}

export type MaterialSort = "date" | "folder"

export type ListMaterialsOptions = {
  folderId?: string | null
  searchQuery?: string
  sort?: MaterialSort
}
