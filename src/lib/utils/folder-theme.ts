import {
  DEFAULT_FOLDER_COLOR,
  FOLDER_COLOR_THEMES,
  type FolderColorId,
} from "@/constants/folder-colors"
import { getFolder } from "@/lib/mocks/folders"

const getTheme = (color: FolderColorId) =>
  FOLDER_COLOR_THEMES[color] ?? FOLDER_COLOR_THEMES[DEFAULT_FOLDER_COLOR]

export const getFolderColorById = (folderId: string | null): FolderColorId | null => {
  if (!folderId) return null
  return getFolder(folderId)?.color ?? null
}

export const getFolderIconClassNameForColor = (color: FolderColorId): string =>
  getTheme(color).iconText

export const getFolderTagClassNameForColor = (color: FolderColorId): string =>
  getTheme(color).tag

export const getFolderSummaryThemeForColor = (color: FolderColorId) => {
  const theme = getTheme(color)
  return { iconBg: theme.iconBg, iconText: theme.iconText }
}

export const getFolderPreviewBackgroundClassNameForColor = (
  color: FolderColorId
): string => getTheme(color).cardGradient

export const getFolderIconClassNameForFolderId = (
  folderId: string | null
): string => {
  const color = getFolderColorById(folderId)
  if (!color) return "text-muted-foreground/70"
  return getFolderIconClassNameForColor(color)
}

export const getFolderTagClassNameForFolderId = (
  folderId: string | null
): string => {
  if (!folderId) return "text-muted-foreground"
  const color = getFolderColorById(folderId)
  if (!color) return "text-muted-foreground"
  return getFolderTagClassNameForColor(color)
}

export const getFolderPreviewBackgroundClassNameForFolderId = (
  folderId: string | null
): string => {
  if (!folderId) return "bg-muted"
  const color = getFolderColorById(folderId)
  if (!color) return "bg-muted"
  return getFolderPreviewBackgroundClassNameForColor(color)
}
