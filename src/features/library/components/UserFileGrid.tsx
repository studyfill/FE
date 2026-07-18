import { FileText } from "lucide-react"

import { FolderCard } from "@/features/library/components/FolderCard"
import { FolderListRow } from "@/features/library/components/FolderListRow"
import { UserFileCard } from "@/features/library/components/UserFileCard"
import { UserFileListRow } from "@/features/library/components/UserFileListRow"
import type {
  FolderListItem,
  UserFile,
  UserFileViewLayout,
} from "@/types/user-file"

type UserFileGridProps = {
  folders?: FolderListItem[]
  userFiles: UserFile[]
  layout?: UserFileViewLayout
  hideUserFileFolderTag?: boolean
}

const LibraryEmptyState = () => (
  <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 text-center">
    <FileText className="mb-3 size-10 text-muted-foreground/40" aria-hidden />
    <p className="text-sm font-medium text-foreground/80">
      표시할 폴더나 PDF가 없습니다
    </p>
    <p className="mt-1 text-xs text-muted-foreground">
      폴더를 만들거나 상단 업로드 버튼으로 학습 자료를 추가하세요
    </p>
  </div>
)

export const UserFileGrid = ({
  folders = [],
  userFiles,
  layout = "grid",
  hideUserFileFolderTag = false,
}: UserFileGridProps) => {
  const isEmpty = folders.length === 0 && userFiles.length === 0

  if (isEmpty) {
    return <LibraryEmptyState />
  }

  if (layout === "list") {
    return (
      <ul className="flex flex-col gap-3">
        {folders.map((folder) => (
          <li key={folder.id} className="min-w-0">
            <FolderListRow folder={folder} />
          </li>
        ))}
        {userFiles.map((userFile) => (
          <li key={userFile.id} className="min-w-0">
            <UserFileListRow
              userFile={userFile}
              hideFolderTag={hideUserFileFolderTag}
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {folders.map((folder) => (
        <li key={folder.id} className="min-w-0">
          <FolderCard folder={folder} />
        </li>
      ))}
      {userFiles.map((userFile) => (
        <li key={userFile.id} className="min-w-0">
          <UserFileCard
            userFile={userFile}
            hideFolderTag={hideUserFileFolderTag}
          />
        </li>
      ))}
    </ul>
  )
}
