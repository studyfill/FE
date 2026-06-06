import type { Folder } from "@/types/material"

export const getDescendantFolderIds = (
  parentId: string,
  folders: Folder[]
): string[] => {
  const children = folders.filter((folder) => folder.parentId === parentId)
  return children.flatMap((child) => [
    child.id,
    ...getDescendantFolderIds(child.id, folders),
  ])
}

export const isFolderDescendant = (
  folders: Folder[],
  ancestorId: string,
  candidateId: string
): boolean => {
  if (ancestorId === candidateId) return true
  return getDescendantFolderIds(ancestorId, folders).includes(candidateId)
}
