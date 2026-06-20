"use client"

import type { UserFile } from "@/types/user-file"

type StudyWorkspaceHeaderProps = {
  userFile: UserFile
}

export const StudyWorkspaceHeader = ({ userFile }: StudyWorkspaceHeaderProps) => {
  return (
    <div className="space-y-1">
      <h1 className="text-lg font-semibold tracking-tight">{userFile.name}</h1>
      <p className="text-sm text-muted-foreground">
        학습 진도 {userFile.progressPercent}%
        {userFile.pageCount > 0 ? ` · ${userFile.pageCount}페이지` : ""}
      </p>
    </div>
  )
}
