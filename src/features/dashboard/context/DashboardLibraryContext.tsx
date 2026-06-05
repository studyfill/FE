"use client"

import {
  createContext,
  useContext,
  type ReactNode,
} from "react"

import { useDashboardLibrary } from "@/features/dashboard/hooks/useDashboardLibrary"

type DashboardLibraryValue = ReturnType<typeof useDashboardLibrary>

const DashboardLibraryContext = createContext<DashboardLibraryValue | null>(
  null
)

type DashboardLibraryProviderProps = {
  folderId: string | null
  children: ReactNode
}

export const DashboardLibraryProvider = ({
  folderId,
  children,
}: DashboardLibraryProviderProps) => {
  const value = useDashboardLibrary(folderId)

  return (
    <DashboardLibraryContext.Provider value={value}>
      {children}
    </DashboardLibraryContext.Provider>
  )
}

export const useDashboardLibraryContext = () => {
  const ctx = useContext(DashboardLibraryContext)
  if (!ctx) {
    throw new Error("useDashboardLibraryContext must be used within provider")
  }
  return ctx
}
