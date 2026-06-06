"use client"

import { useTransition } from "react"

import { enterGuestModeAction } from "@/features/auth/actions"

export const useEnterGuestMode = () => {
  const [isPending, startTransition] = useTransition()

  const enterGuestMode = () => {
    startTransition(() => {
      void enterGuestModeAction()
    })
  }

  return { enterGuestMode, isPending }
}
