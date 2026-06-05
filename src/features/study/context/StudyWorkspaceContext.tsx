"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

import type { Material } from "@/types/material"

type StudyWorkspaceContextValue = {
  materialId: string
  material: Material
  setPage: (page: number) => void
  highlightPage: number | null
  setHighlightPage: (page: number | null) => void
}

const StudyWorkspaceContext = createContext<StudyWorkspaceContextValue | null>(
  null
)

type StudyWorkspaceProviderProps = {
  materialId: string
  material: Material
  setPage: (page: number) => void
  children: ReactNode
}

export const StudyWorkspaceProvider = ({
  materialId,
  material,
  setPage,
  children,
}: StudyWorkspaceProviderProps) => {
  const [highlightPage, setHighlightPage] = useState<number | null>(null)

  return (
    <StudyWorkspaceContext.Provider
      value={{
        materialId,
        material,
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
