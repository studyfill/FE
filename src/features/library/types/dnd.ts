export type LibraryDragData =
  | { type: "userFile"; userFileId: string; label: string }
  | { type: "folder"; folderId: string; label: string }

export const userFileDragId = (userFileId: string) => `userFile-${userFileId}`

export const folderDragId = (folderId: string) => `folder-drag-${folderId}`

export const folderDropId = (folderId: string) => `folder-drop-${folderId}`

export const parseFolderDropId = (id: string | number): string | null => {
  const value = String(id)
  if (!value.startsWith("folder-drop-")) return null
  return value.slice("folder-drop-".length)
}
