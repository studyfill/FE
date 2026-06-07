"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { AuthDialog } from "@/features/auth/components/AuthDialog"

type LandingAuthDialogContextValue = {
  openLogin: () => void
}

const LandingAuthDialogContext =
  createContext<LandingAuthDialogContextValue | null>(null)

export const useLandingAuthDialog = () => {
  const context = useContext(LandingAuthDialogContext)
  if (!context) {
    throw new Error(
      "useLandingAuthDialog must be used within LandingAuthDialogProvider"
    )
  }
  return context
}

type LandingAuthDialogProviderProps = {
  children: ReactNode
}

export const LandingAuthDialogProvider = ({
  children,
}: LandingAuthDialogProviderProps) => {
  const [open, setOpen] = useState(false)

  const openLogin = useCallback(() => {
    setOpen(true)
  }, [])

  const value = useMemo(
    () => ({
      openLogin,
    }),
    [openLogin]
  )

  return (
    <LandingAuthDialogContext.Provider value={value}>
      {children}
      <AuthDialog open={open} onOpenChange={setOpen} />
    </LandingAuthDialogContext.Provider>
  )
}
