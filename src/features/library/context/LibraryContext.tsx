"use client"

import {
  createContext,
  useContext,
  type ReactNode,
} from "react"

import { useLibrary } from "@/features/library/hooks/useLibrary"

type LibraryValue = ReturnType<typeof useLibrary>

const LibraryContext = createContext<LibraryValue | null>(
  null
)

type LibraryProviderProps = {
  folderId: string | null
  children: ReactNode
}

export const LibraryProvider = ({
  folderId,
  children,
}: LibraryProviderProps) => {
  const value = useLibrary(folderId)

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  )
}

export const useLibraryContext = () => {
  const ctx = useContext(LibraryContext)
  if (!ctx) {
    throw new Error("useLibraryContext must be used within provider")
  }
  return ctx
}
