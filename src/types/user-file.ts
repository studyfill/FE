import type { FolderColorId } from "@/constants/folder-colors"

export type ExtractionStatus = "pending" | "processing" | "done" | "failed"

export type UserFileType = "pdf" | "image"

export type UserFile = {
  id: string
  name: string
  folderId: string | null
  fileType: UserFileType
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
  favorite?: boolean
}

export type FolderTreeNode = Folder & {
  children: FolderTreeNode[]
  fileCount: number
}

export type FolderListItem = Folder & {
  fileCount: number
}

export type RecentFolderItem = {
  id: string
  name: string
  color: FolderColorId
  fileCount: number
}

export type UserFileSort = "recent" | "created" | "folder"

export type UserFileViewLayout = "grid" | "list"

export type ListUserFilesOptions = {
  folderId?: string | null
  searchQuery?: string
  sort?: UserFileSort
}
