import type { Folder, FolderTreeNode } from "@/types/material"

import { UNASSIGNED_FOLDER_LABEL } from "@/constants/folder"
import { DEFAULT_UPLOAD_FOLDER_ID, FOLDER_IDS } from "./folder-ids"
import { loadMockStore } from "./mock-store"

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

const countMaterialsInScope = (
  folderId: string,
  folders: Folder[],
  materials: { folderId: string | null }[]
): number => {
  const scope = getFolderScopeIds(folderId, folders) ?? [folderId]
  return materials.filter(
    (m) => m.folderId !== null && scope.includes(m.folderId)
  ).length
}

export type SidebarFolderItem = Folder & { materialCount: number }

const SIDEBAR_FOLDER_ORDER = [
  FOLDER_IDS.major,
  FOLDER_IDS.ds,
  FOLDER_IDS.os,
  FOLDER_IDS.liberal,
  FOLDER_IDS.exam,
] as const

export const listSidebarFolders = (): SidebarFolderItem[] => {
  const store = loadMockStore()
  const { folders, materials } = store

  return SIDEBAR_FOLDER_ORDER.flatMap((id) => {
    const folder = folders.find((f) => f.id === id)
    if (!folder) return []

    const hasChildren = folders.some((f) => f.parentId === id)
    const materialCount = hasChildren
      ? countMaterialsInScope(id, folders, materials)
      : materials.filter((m) => m.folderId === id).length

    return [{ ...folder, materialCount }]
  })
}

export type RootFolderSummary = {
  id: string
  name: string
  materialCount: number
  pinned?: boolean
}

export const listRootFolderSummaries = (): RootFolderSummary[] => {
  const store = loadMockStore()
  const { folders, materials } = store

  const rootOrder = ["전공", "교양", "시험대비"]

  return folders
    .filter((f) => f.parentId === null)
    .sort(
      (a, b) => rootOrder.indexOf(a.name) - rootOrder.indexOf(b.name)
    )
    .map((folder) => ({
      id: folder.id,
      name: folder.name,
      materialCount: countMaterialsInScope(folder.id, folders, materials),
      pinned: folder.pinned,
    }))
}

export const listFolderTree = (): FolderTreeNode[] => {
  const store = loadMockStore()
  const { folders, materials } = store

  const buildNode = (folder: Folder): FolderTreeNode => {
    const children = folders
      .filter((f) => f.parentId === folder.id)
      .sort((a, b) => a.name.localeCompare(b.name, "ko"))
      .map(buildNode)

    const directCount = materials.filter((m) => m.folderId === folder.id).length
    const subtreeCount = countMaterialsInScope(folder.id, folders, materials)

    return {
      ...folder,
      children,
      materialCount: children.length > 0 ? subtreeCount : directCount,
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
