"use client"

import {
  createContext,
  useContext,
  type ReactNode,
} from "react"

import { useExplanationEdits } from "@/features/explanation/hooks/useExplanationEdits"

type ExplanationEditContextValue = ReturnType<typeof useExplanationEdits>

const ExplanationEditContext = createContext<ExplanationEditContextValue | null>(
  null
)

type ExplanationEditProviderProps = {
  materialId: string
  generatedAt: string
  children: ReactNode
}

export const ExplanationEditProvider = ({
  materialId,
  generatedAt,
  children,
}: ExplanationEditProviderProps) => {
  const edits = useExplanationEdits(materialId, generatedAt)

  return (
    <ExplanationEditContext.Provider value={edits}>
      {children}
    </ExplanationEditContext.Provider>
  )
}

export const useExplanationEdit = () => {
  const context = useContext(ExplanationEditContext)
  if (!context) {
    throw new Error(
      "useExplanationEdit must be used within ExplanationEditProvider"
    )
  }
  return context
}
