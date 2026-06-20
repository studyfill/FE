"use client"

import {
  createContext,
  useContext,
  type ReactNode,
} from "react"

import { useNoteEdits } from "@/features/note/hooks/useNoteEdits"

type NoteEditContextValue = ReturnType<typeof useNoteEdits>

const NoteEditContext = createContext<NoteEditContextValue | null>(
  null
)

type NoteEditProviderProps = {
  userFileId: string
  generatedAt: string
  children: ReactNode
}

export const NoteEditProvider = ({
  userFileId,
  generatedAt,
  children,
}: NoteEditProviderProps) => {
  const edits = useNoteEdits(userFileId, generatedAt)

  return (
    <NoteEditContext.Provider value={edits}>
      {children}
    </NoteEditContext.Provider>
  )
}

export const useNoteEdit = () => {
  const context = useContext(NoteEditContext)
  if (!context) {
    throw new Error(
      "useNoteEdit must be used within NoteEditProvider"
    )
  }
  return context
}
