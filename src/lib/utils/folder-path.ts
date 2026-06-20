import type { Folder } from "@/types/user-file"

export const getFolderAncestorPath = (
  folderId: string | null,
  folders: Folder[]
): Folder[] => {
  if (!folderId) return []

  const path: Folder[] = []
  let current = folders.find((folder) => folder.id === folderId)

  while (current) {
    path.unshift(current)
    current = current.parentId
      ? folders.find((folder) => folder.id === current!.parentId)
      : undefined
  }

  return path
}
