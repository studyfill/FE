import type { FolderColorId } from "@/constants/folder-colors"

export type ExtractionStatus = "pending" | "processing" | "done" | "failed"

export type MaterialFileType = "pdf" | "image"

export type Material = {
  id: string
  name: string
  folderId: string | null
  fileType: MaterialFileType
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
  color: FolderColorId
  pinned?: boolean
}

export type FolderTreeNode = Folder & {
  children: FolderTreeNode[]
  materialCount: number
}

export type MaterialSort = "recent" | "created" | "folder"

export type MaterialViewLayout = "grid" | "list"

export type ListMaterialsOptions = {
  folderId?: string | null
  searchQuery?: string
  sort?: MaterialSort
}
