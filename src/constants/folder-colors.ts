export const FOLDER_COLOR_IDS = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "indigo",
  "violet",
  "pink",
] as const

export type FolderColorId = (typeof FOLDER_COLOR_IDS)[number]

export const DEFAULT_FOLDER_COLOR: FolderColorId = "green"

export type FolderColorTheme = {
  swatch: string
  swatchRing: string
  previewPanel: string
  iconBg: string
  iconText: string
  tag: string
  cardGradient: string
}

export const FOLDER_COLOR_THEMES: Record<FolderColorId, FolderColorTheme> = {
  red: {
    swatch: "bg-red-500",
    swatchRing: "ring-red-600",
    previewPanel: "bg-red-50",
    iconBg: "bg-red-100",
    iconText: "text-red-700",
    tag: "text-red-700",
    cardGradient: "bg-gradient-to-b from-red-300/40 to-red-200",
  },
  orange: {
    swatch: "bg-orange-500",
    swatchRing: "ring-orange-600",
    previewPanel: "bg-orange-50",
    iconBg: "bg-orange-100",
    iconText: "text-orange-700",
    tag: "text-orange-700",
    cardGradient: "bg-gradient-to-b from-orange-300/40 to-orange-200",
  },
  yellow: {
    swatch: "bg-yellow-400",
    swatchRing: "ring-yellow-500",
    previewPanel: "bg-yellow-50",
    iconBg: "bg-yellow-100",
    iconText: "text-yellow-800",
    tag: "text-yellow-800",
    cardGradient: "bg-gradient-to-b from-yellow-300/45 to-yellow-200",
  },
  green: {
    swatch: "bg-green-600",
    swatchRing: "ring-green-700",
    previewPanel: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-800",
    tag: "text-emerald-700",
    cardGradient: "bg-gradient-to-b from-emerald-300/40 to-emerald-200",
  },
  blue: {
    swatch: "bg-blue-500",
    swatchRing: "ring-blue-600",
    previewPanel: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconText: "text-blue-700",
    tag: "text-blue-700",
    cardGradient: "bg-gradient-to-b from-blue-300/40 to-blue-200",
  },
  indigo: {
    swatch: "bg-indigo-500",
    swatchRing: "ring-indigo-600",
    previewPanel: "bg-indigo-50",
    iconBg: "bg-indigo-100",
    iconText: "text-indigo-700",
    tag: "text-indigo-700",
    cardGradient: "bg-gradient-to-b from-indigo-300/40 to-indigo-200",
  },
  violet: {
    swatch: "bg-violet-500",
    swatchRing: "ring-violet-600",
    previewPanel: "bg-violet-50",
    iconBg: "bg-violet-100",
    iconText: "text-violet-700",
    tag: "text-violet-700",
    cardGradient: "bg-gradient-to-b from-violet-300/40 to-violet-200",
  },
  pink: {
    swatch: "bg-pink-500",
    swatchRing: "ring-pink-600",
    previewPanel: "bg-pink-50",
    iconBg: "bg-pink-100",
    iconText: "text-pink-700",
    tag: "text-pink-700",
    cardGradient: "bg-gradient-to-b from-pink-300/40 to-pink-200",
  },
}

export const FOLDER_COLOR_OPTIONS = FOLDER_COLOR_IDS.map((id) => ({
  id,
  theme: FOLDER_COLOR_THEMES[id],
}))

export const isFolderColorId = (value: string): value is FolderColorId =>
  (FOLDER_COLOR_IDS as readonly string[]).includes(value)
