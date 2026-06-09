"use client"

import { useTransition } from "react"

import { googleSignInAction } from "@/features/auth/actions"

export const useGoogleSignIn = () => {
  const [isPending, startTransition] = useTransition()

  const signInWithGoogle = () => {
    startTransition(() => {
      void googleSignInAction()
    })
  }

  return { signInWithGoogle, isPending }
}
