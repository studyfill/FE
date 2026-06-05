import type { FolderColorId } from "@/constants/folder-colors"

import { getFolderScopeIds } from "./folders"
import { loadMockStore } from "./mock-store"

export type RecentFolderItem = {
  id: string
  name: string
  color: FolderColorId
  materialCount: number
}

const STORAGE_KEY = "studyfill-recent-folders"
const MAX_RECENT = 10

const getFolderMaterialCount = (folderId: string): number => {
  const store = loadMockStore()
  const { folders, materials } = store
  const hasChildren = folders.some((f) => f.parentId === folderId)
  const scope = getFolderScopeIds(folderId, folders) ?? [folderId]

  if (hasChildren) {
    return materials.filter(
      (m) => m.folderId !== null && scope.includes(m.folderId)
    ).length
  }

  return materials.filter((m) => m.folderId === folderId).length
}

const getStoredIds = (): string[] => {
  if (typeof window === "undefined") return []

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is string => typeof id === "string")
  } catch {
    return []
  }
}

const getDefaultRecentIds = (): string[] => {
  const { materials } = loadMockStore()
  const lastUsedByFolder = new Map<string, number>()

  for (const material of materials) {
    if (!material.folderId) continue
    const time = new Date(material.uploadedAt).getTime()
    const prev = lastUsedByFolder.get(material.folderId) ?? 0
    if (time > prev) lastUsedByFolder.set(material.folderId, time)
  }

  return [...lastUsedByFolder.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([folderId]) => folderId)
    .slice(0, MAX_RECENT)
}

export const recordRecentFolder = (folderId: string): void => {
  if (typeof window === "undefined") return

  const store = loadMockStore()
  if (!store.folders.some((f) => f.id === folderId)) return

  const next = [folderId, ...getStoredIds().filter((id) => id !== folderId)].slice(
    0,
    MAX_RECENT
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export const listRecentFolders = (): RecentFolderItem[] => {
  const store = loadMockStore()
  const stored = getStoredIds()
  const ids = stored.length > 0 ? stored : getDefaultRecentIds()

  return ids.flatMap((id) => {
    const folder = store.folders.find((f) => f.id === id)
    if (!folder) return []

    return [
      {
        id: folder.id,
        name: folder.name,
        color: folder.color,
        materialCount: getFolderMaterialCount(folder.id),
      },
    ]
  })
}
