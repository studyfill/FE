"use client"

import { Layers, X } from "lucide-react"
import { useEffect } from "react"
import { createPortal } from "react-dom"

import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton"
import { useGoogleSignIn } from "@/features/auth/hooks/useGoogleSignIn"
import { useEnterGuestMode } from "@/features/auth/hooks/useEnterGuestMode"
import { useClientMounted } from "@/features/landing/hooks/useClientMounted"

type AuthDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const mounted = useClientMounted()
  const { signInWithGoogle, isPending: isGooglePending } = useGoogleSignIn()
  const { enterGuestMode, isPending: isGuestPending } = useEnterGuestMode()

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onOpenChange])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleGoogleSignIn = () => {
    signInWithGoogle()
  }

  const handleGuestSignIn = () => {
    onOpenChange(false)
    enterGuestMode()
  }

  if (!mounted || !open) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="로그인 창 닫기"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        className="relative z-10 w-full max-w-dialog-sm overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-border/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex items-center gap-2.5 border-b border-border/50 bg-gradient-to-r from-landing-hero-from/40 to-background px-4 py-3">
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
            aria-hidden
          >
            <Layers className="size-3.5" strokeWidth={2.25} />
          </span>
          <h2
            id="auth-dialog-title"
            className="min-w-0 flex-1 text-body font-semibold text-foreground"
          >
            로그인
          </h2>
          <button
            type="button"
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={handleClose}
            aria-label="닫기"
          >
            <X className="size-3.5" />
          </button>
        </div>

        <div className="space-y-4 px-4 py-4">
          <GoogleSignInButton
            onClick={handleGoogleSignIn}
            disabled={isGooglePending || isGuestPending}
          />
          <button
            type="button"
            className="w-full text-center text-body-sm text-muted-foreground transition-colors hover:text-primary"
            onClick={handleGuestSignIn}
            disabled={isGooglePending || isGuestPending}
          >
            {isGuestPending ? "이동 중…" : "게스트로 체험하기"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
