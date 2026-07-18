// 최근 방문 폴더 strip. 방문한 폴더 id 를 localStorage 에 쌓고, 이름·색·자료수는 폴더 캐시에서 해석한다.
// (실 백엔드 폴더 id = UUID. mock 최근폴더(src/lib/mocks/recent-folders)는 랜딩 목업 전용이므로 키를 분리한다.)
import type { RecentFolderItem } from "@/types/user-file"

import { getCachedFolder } from "./folders"

const STORAGE_KEY = "studyfill-recent-folders-v2"
const MAX_RECENT = 10

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

export const recordRecentFolder = (folderId: string): void => {
  if (typeof window === "undefined") return
  const next = [
    folderId,
    ...getStoredIds().filter((id) => id !== folderId),
  ].slice(0, MAX_RECENT)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export const removeRecentFolder = (folderId: string): void => {
  if (typeof window === "undefined") return
  const next = getStoredIds().filter((id) => id !== folderId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export const listRecentFolders = (): RecentFolderItem[] =>
  getStoredIds().flatMap((id) => {
    const folder = getCachedFolder(id)
    if (!folder) return []
    return [
      {
        id: folder.id,
        name: folder.name,
        color: folder.color,
        fileCount: folder.fileCount ?? 0,
      },
    ]
  })
