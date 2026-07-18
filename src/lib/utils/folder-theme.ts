import {
  DEFAULT_FOLDER_COLOR,
  FOLDER_COLOR_THEMES,
  type FolderColorId,
} from "@/constants/folder-colors"
import { getCachedFolder } from "@/lib/api/folders"

const getTheme = (color: FolderColorId) =>
  FOLDER_COLOR_THEMES[color] ?? FOLDER_COLOR_THEMES[DEFAULT_FOLDER_COLOR]

export const getFolderColorById = (folderId: string | null): FolderColorId | null => {
  if (!folderId) return null
  return getCachedFolder(folderId)?.color ?? null
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

const FOLDER_ACCENT_BORDER: Record<FolderColorId, string> = {
  red: "border-l-red-400/75",
  orange: "border-l-orange-400/75",
  yellow: "border-l-yellow-500/75",
  green: "border-l-emerald-500/75",
  blue: "border-l-blue-400/75",
  indigo: "border-l-indigo-400/75",
  violet: "border-l-violet-400/75",
  pink: "border-l-pink-400/75",
}

export const getFolderAccentBorderClassNameForColor = (
  color: FolderColorId
): string =>
  FOLDER_ACCENT_BORDER[color] ?? FOLDER_ACCENT_BORDER[DEFAULT_FOLDER_COLOR]

export const getFolderAccentBorderClassNameForFolderId = (
  folderId: string | null
): string => {
  const color = getFolderColorById(folderId)
  if (!color) return "border-l-slate-300/80"
  return getFolderAccentBorderClassNameForColor(color)
}

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
