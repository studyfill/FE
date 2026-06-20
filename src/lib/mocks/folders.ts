import type { Folder, FolderTreeNode } from "@/types/user-file"

import { isFolderColorId, type FolderColorId } from "@/constants/folder-colors"
import { UNASSIGNED_FOLDER_LABEL } from "@/constants/folder"
import { isFolderDescendant } from "@/lib/utils/folder-tree"
import { DEFAULT_UPLOAD_FOLDER_ID, FOLDER_IDS } from "./folder-ids"
import { loadMockStore, saveMockStore } from "./mock-store"

export { DEFAULT_UPLOAD_FOLDER_ID, FOLDER_IDS, UNASSIGNED_FOLDER_LABEL }

export const getFolder = (id: string): Folder | undefined => {
  const store = loadMockStore()
  return store.folders.find((f) => f.id === id)
}

export const getFolderName = (folderId: string | null): string => {
  if (!folderId) return UNASSIGNED_FOLDER_LABEL
  return getFolder(folderId)?.name ?? "알 수 없음"
}

const getChildFolderIds = (parentId: string, folders: Folder[]): string[] => {
  const children = folders.filter((f) => f.parentId === parentId)
  return children.flatMap((child) => [
    child.id,
    ...getChildFolderIds(child.id, folders),
  ])
}

export const getFolderScopeIds = (
  folderId: string | null | undefined,
  folders: Folder[]
): string[] | null => {
  if (!folderId) return null

  const folder = folders.find((f) => f.id === folderId)
  if (!folder) return [folderId]

  const hasChildren = folders.some((f) => f.parentId === folderId)
  if (!hasChildren) return [folderId]

  return [folderId, ...getChildFolderIds(folderId, folders)]
}

const countUserFilesInScope = (
  folderId: string,
  folders: Folder[],
  userFiles: { folderId: string | null }[]
): number => {
  const scope = getFolderScopeIds(folderId, folders) ?? [folderId]
  return userFiles.filter(
    (m) => m.folderId !== null && scope.includes(m.folderId)
  ).length
}

export type SidebarFolderItem = Folder & { fileCount: number }

const SIDEBAR_FOLDER_ORDER = [
  FOLDER_IDS.major,
  FOLDER_IDS.ds,
  FOLDER_IDS.os,
  FOLDER_IDS.liberal,
  FOLDER_IDS.exam,
] as const

export const listSidebarFolders = (): SidebarFolderItem[] => {
  const store = loadMockStore()
  const { folders, userFiles } = store

  return SIDEBAR_FOLDER_ORDER.flatMap((id) => {
    const folder = folders.find((f) => f.id === id)
    if (!folder) return []

    const hasChildren = folders.some((f) => f.parentId === id)
    const fileCount = hasChildren
      ? countUserFilesInScope(id, folders, userFiles)
      : userFiles.filter((m) => m.folderId === id).length

    return [{ ...folder, fileCount }]
  })
}

export type RootFolderSummary = {
  id: string
  name: string
  fileCount: number
  pinned?: boolean
}

export const listRootFolderSummaries = (): RootFolderSummary[] => {
  const store = loadMockStore()
  const { folders, userFiles } = store

  const rootOrder = ["전공", "교양", "시험대비"]

  return folders
    .filter((f) => f.parentId === null)
    .sort(
      (a, b) => rootOrder.indexOf(a.name) - rootOrder.indexOf(b.name)
    )
    .map((folder) => ({
      id: folder.id,
      name: folder.name,
      fileCount: countUserFilesInScope(folder.id, folders, userFiles),
      pinned: folder.pinned,
    }))
}

export const createFolder = (
  name: string,
  color: FolderColorId,
  parentId: string | null = null
): Folder => {
  const trimmed = name.trim()
  if (!trimmed) {
    throw new Error("폴더 이름을 입력해 주세요.")
  }
  if (trimmed.length > 40) {
    throw new Error("폴더 이름은 40자 이하로 입력해 주세요.")
  }
  if (!isFolderColorId(color)) {
    throw new Error("색상을 선택해 주세요.")
  }

  const store = loadMockStore()

  if (parentId) {
    const parent = store.folders.find((f) => f.id === parentId)
    if (!parent) {
      throw new Error("상위 폴더를 찾을 수 없습니다.")
    }
  }

  const duplicate = store.folders.some(
    (f) =>
      f.parentId === parentId &&
      f.name.trim().toLowerCase() === trimmed.toLowerCase()
  )
  if (duplicate) {
    throw new Error("같은 위치에 동일한 이름의 폴더가 있습니다.")
  }

  const folder: Folder = {
    id: `folder-${Date.now()}`,
    name: trimmed,
    parentId,
    color,
  }

  store.folders.push(folder)
  saveMockStore(store)

  return folder
}

export const moveFolder = (folderId: string, newParentId: string): Folder => {
  const store = loadMockStore()
  const folder = store.folders.find((item) => item.id === folderId)
  if (!folder) {
    throw new Error("폴더를 찾을 수 없습니다.")
  }

  const newParent = store.folders.find((item) => item.id === newParentId)
  if (!newParent) {
    throw new Error("대상 폴더를 찾을 수 없습니다.")
  }

  if (folder.parentId === newParentId) {
    return folder
  }

  if (isFolderDescendant(store.folders, folderId, newParentId)) {
    throw new Error("폴더를 자기 자신 또는 하위 폴더로 이동할 수 없습니다.")
  }

  const duplicate = store.folders.some(
    (item) =>
      item.id !== folderId &&
      item.parentId === newParentId &&
      item.name.trim().toLowerCase() === folder.name.trim().toLowerCase()
  )
  if (duplicate) {
    throw new Error("같은 위치에 동일한 이름의 폴더가 있습니다.")
  }

  folder.parentId = newParentId
  saveMockStore(store)
  return folder
}

export type FolderGridItem = Folder & { fileCount: number }

const compareSiblingFolders = (a: Folder, b: Folder) => {
  if (a.pinned && !b.pinned) return -1
  if (!a.pinned && b.pinned) return 1
  return a.name.localeCompare(b.name, "ko")
}

export const listChildFolders = (
  parentId: string | null
): FolderGridItem[] => {
  const store = loadMockStore()
  const { folders, userFiles } = store

  return folders
    .filter((folder) => folder.parentId === parentId)
    .sort(compareSiblingFolders)
    .map((folder) => {
      const hasChildren = folders.some((entry) => entry.parentId === folder.id)
      const directCount = userFiles.filter((m) => m.folderId === folder.id).length
      const fileCount = hasChildren
        ? countUserFilesInScope(folder.id, folders, userFiles)
        : directCount

      return { ...folder, fileCount }
    })
}

export const searchFolders = (query: string): FolderGridItem[] => {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const store = loadMockStore()
  const { folders, userFiles } = store

  return folders
    .filter((folder) => folder.name.toLowerCase().includes(q))
    .sort(compareSiblingFolders)
    .map((folder) => {
      const hasChildren = folders.some((entry) => entry.parentId === folder.id)
      const directCount = userFiles.filter((m) => m.folderId === folder.id).length
      const fileCount = hasChildren
        ? countUserFilesInScope(folder.id, folders, userFiles)
        : directCount

      return { ...folder, fileCount }
    })
}

export const listFolderTree = (): FolderTreeNode[] => {
  const store = loadMockStore()
  const { folders, userFiles } = store

  const buildNode = (folder: Folder): FolderTreeNode => {
    const children = folders
      .filter((f) => f.parentId === folder.id)
      .sort((a, b) => a.name.localeCompare(b.name, "ko"))
      .map(buildNode)

    const directCount = userFiles.filter((m) => m.folderId === folder.id).length
    const subtreeCount = countUserFilesInScope(folder.id, folders, userFiles)

    return {
      ...folder,
      children,
      fileCount: children.length > 0 ? subtreeCount : directCount,
    }
  }

  return folders
    .filter((f) => f.parentId === null)
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return a.name.localeCompare(b.name, "ko")
    })
    .map(buildNode)
}
