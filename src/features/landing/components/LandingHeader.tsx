"use client"

import Link from "next/link"
import { useState } from "react"
import { Layers, Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/constants"
import { ROUTES } from "@/constants/routes"
import { useEnterGuestMode } from "@/features/auth/hooks/useEnterGuestMode"
import { useLandingAuthDialog } from "@/features/landing/components/LandingAuthDialogProvider"
import { LANDING_NAV_LINKS } from "@/features/landing/constants/landing-content"
import { cn } from "@/lib/utils"

export const LandingHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { openLogin } = useLandingAuthDialog()
  const { enterGuestMode, isPending: isGuestPending } = useEnterGuestMode()

  const handleNavClick = () => {
    setMobileOpen(false)
  }

  const handleLoginOpen = () => {
    setMobileOpen(false)
    openLogin()
  }

  const handleGetStarted = () => {
    setMobileOpen(false)
    enterGuestMode()
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-landing-hero-to/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href={ROUTES.home}
          className="flex shrink-0 items-center gap-2.5"
          onClick={handleNavClick}
        >
          <span
            className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
            aria-hidden
          >
            <Layers className="size-icon-md" strokeWidth={2.25} />
          </span>
          <span className="text-body font-semibold tracking-tight">{APP_NAME}</span>
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="랜딩 페이지 메뉴"
        >
          {LANDING_NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-body-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="hidden sm:inline-flex"
            onClick={handleLoginOpen}
          >
            로그인
          </Button>
          <Button
            size="sm"
            type="button"
            className="rounded-button"
            onClick={handleGetStarted}
            disabled={isGuestPending}
          >
            {isGuestPending ? "이동 중…" : "무료로 시작하기"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border/60 bg-background md:hidden",
          mobileOpen ? "max-h-64" : "max-h-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3" aria-label="모바일 메뉴">
          {LANDING_NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2.5 text-body font-medium text-foreground hover:bg-muted"
              onClick={handleNavClick}
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            className="rounded-lg px-3 py-2.5 text-left text-body font-medium text-muted-foreground hover:bg-muted sm:hidden"
            onClick={handleLoginOpen}
          >
            로그인
          </button>
        </nav>
      </div>
    </header>
  )
}
