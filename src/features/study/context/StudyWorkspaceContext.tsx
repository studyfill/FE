"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

import type { UserFile } from "@/types/user-file"

type StudyWorkspaceContextValue = {
  userFileId: string
  userFile: UserFile
  setPage: (page: number) => void
  highlightPage: number | null
  setHighlightPage: (page: number | null) => void
}

const StudyWorkspaceContext = createContext<StudyWorkspaceContextValue | null>(
  null
)

type StudyWorkspaceProviderProps = {
  userFileId: string
  userFile: UserFile
  setPage: (page: number) => void
  children: ReactNode
}

export const StudyWorkspaceProvider = ({
  userFileId,
  userFile,
  setPage,
  children,
}: StudyWorkspaceProviderProps) => {
  const [highlightPage, setHighlightPage] = useState<number | null>(null)

  return (
    <StudyWorkspaceContext.Provider
      value={{
        userFileId,
        userFile,
        setPage,
        highlightPage,
        setHighlightPage,
      }}
    >
      {children}
    </StudyWorkspaceContext.Provider>
  )
}

export const useStudyWorkspace = () => {
  const context = useContext(StudyWorkspaceContext)
  if (!context) {
    throw new Error("useStudyWorkspace must be used within StudyWorkspaceProvider")
  }
  return context
}
