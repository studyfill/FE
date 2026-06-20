"use client"

import { LogOut, Settings } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { GUEST_DISPLAY_NAME } from "@/constants/auth"
import { Button } from "@/components/ui/button"
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { logoutAction } from "@/features/auth/actions"
import { cn } from "@/lib/utils"

const STORAGE_USED_GB = 3.2
const STORAGE_TOTAL_GB = 5
const STORAGE_PERCENT = (STORAGE_USED_GB / STORAGE_TOTAL_GB) * 100

type LibrarySidebarFooterProps = {
  userName?: string
}

const getAvatarInitial = (name: string): string => {
  const trimmed = name.replace(/님$/, "").trim()
  if (!trimmed) return "학"
  if (trimmed === GUEST_DISPLAY_NAME) return "G"
  return trimmed.slice(-1)
}

const getDisplayName = (name?: string): string => {
  if (!name) return "학습자"
  const base = name.replace(/님$/, "")
  if (base === GUEST_DISPLAY_NAME) return `${GUEST_DISPLAY_NAME}님`
  return base
}

export const LibrarySidebarFooter = ({
  userName,
}: LibrarySidebarFooterProps) => {
  const displayName = getDisplayName(userName)
  const initial = getAvatarInitial(displayName)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!settingsOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) {
        setSettingsOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [settingsOpen])

  const handleLogout = () => {
    setSettingsOpen(false)
    void logoutAction()
  }

  return (
    <div className="mt-auto space-y-3 border-t border-sidebar-border pt-3">
      <div className="space-y-2 px-1">
        <div className="flex items-center justify-between text-caption">
          <span className="font-medium text-sidebar-foreground">저장공간</span>
          <span className="tabular-nums text-muted-foreground">
            {STORAGE_USED_GB} / {STORAGE_TOTAL_GB} GB
          </span>
        </div>
        <Progress value={STORAGE_PERCENT} className="gap-0">
          <ProgressTrack className="h-2 bg-sidebar-accent">
            <ProgressIndicator className="bg-primary" />
          </ProgressTrack>
        </Progress>
      </div>

      <Separator className="bg-sidebar-border" />

      <div className="flex items-center gap-2.5 px-1">
        <Avatar className="size-9 after:border-primary/20">
          <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-medium text-sidebar-foreground">
            {displayName}
          </p>
          <p className="truncate text-caption text-muted-foreground">
            <span>무료 플랜</span>
            <span className="mx-1 text-muted-foreground/60">·</span>
            <button
              type="button"
              className="text-primary hover:underline"
              aria-label="플랜 업그레이드"
            >
              업그레이드
            </button>
          </p>
        </div>
        <div ref={settingsRef} className="relative shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 text-muted-foreground hover:text-foreground"
            aria-label="설정"
            aria-expanded={settingsOpen}
            aria-haspopup="menu"
            onClick={() => setSettingsOpen((open) => !open)}
          >
            <Settings className="size-icon-md" />
          </Button>

          {settingsOpen ? (
            <div
              role="menu"
              className="absolute right-0 bottom-full z-50 mb-1 min-w-[9rem] rounded-lg border border-border bg-popover p-1 shadow-md"
            >
              <button
                type="button"
                role="menuitem"
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-muted/60"
                )}
                onClick={handleLogout}
              >
                <LogOut className="size-4 shrink-0 text-muted-foreground" />
                로그아웃
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
