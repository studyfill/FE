export const getFolderTagClassName = (folderName: string): string => {
  if (folderName.includes("자료구조")) return "text-emerald-700"
  if (folderName.includes("시험")) return "text-rose-700"
  if (folderName.includes("운영체제")) return "text-sky-700"
  if (folderName.includes("전공")) return "text-blue-700"
  if (folderName.includes("교양")) return "text-amber-700"
  return "text-muted-foreground"
}

export const getFolderIconClassName = (folderName: string): string => {
  if (folderName.includes("자료구조")) return "text-emerald-600"
  if (folderName.includes("시험")) return "text-rose-600"
  if (folderName.includes("운영체제")) return "text-sky-600"
  if (folderName.includes("전공")) return "text-blue-600"
  if (folderName.includes("교양")) return "text-amber-600"
  return "text-muted-foreground/70"
}

type FolderSummaryTheme = {
  iconBg: string
  iconText: string
}

export const getFolderSummaryTheme = (folderName: string): FolderSummaryTheme => {
  if (folderName.includes("자료구조")) {
    return { iconBg: "bg-emerald-200", iconText: "text-emerald-800" }
  }
  if (folderName.includes("시험")) {
    return { iconBg: "bg-rose-200", iconText: "text-rose-800" }
  }
  if (folderName.includes("운영체제")) {
    return { iconBg: "bg-sky-200", iconText: "text-sky-800" }
  }
  if (folderName.includes("전공")) {
    return { iconBg: "bg-blue-200", iconText: "text-blue-800" }
  }
  if (folderName.includes("교양")) {
    return { iconBg: "bg-amber-200", iconText: "text-amber-800" }
  }
  return { iconBg: "bg-sky-200", iconText: "text-sky-800" }
}

import { UNASSIGNED_FOLDER_LABEL } from "@/constants/folder"
import { getFolderName } from "@/lib/mocks/folders"

export const getFolderPreviewBackgroundClassNameForFolderId = (
  folderId: string | null
): string => {
  if (!folderId) {
    return "bg-muted"
  }

  return getFolderPreviewBackgroundClassName(getFolderName(folderId))
}

export const getFolderTagClassNameForFolderId = (
  folderId: string | null
): string => {
  if (!folderId) return "text-muted-foreground"
  return getFolderTagClassName(getFolderName(folderId))
}

export const getFolderPreviewBackgroundClassName = (
  folderName: string
): string => {
  if (folderName === UNASSIGNED_FOLDER_LABEL || !folderName) {
    return "bg-muted"
  }
  if (folderName.includes("자료구조")) {
    return "bg-gradient-to-b from-emerald-300/35 to-emerald-200"
  }
  if (folderName.includes("시험")) {
    return "bg-gradient-to-b from-rose-300/35 to-rose-200"
  }
  if (folderName.includes("운영체제")) {
    return "bg-gradient-to-b from-sky-300/35 to-sky-200"
  }
  if (folderName.includes("전공")) {
    return "bg-gradient-to-b from-blue-300/35 to-blue-200"
  }
  if (folderName.includes("교양")) {
    return "bg-gradient-to-b from-amber-300/35 to-amber-200"
  }
  return "bg-muted"
}
