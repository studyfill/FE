"use client"

import { Settings } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

const STORAGE_USED_GB = 3.2
const STORAGE_TOTAL_GB = 5
const STORAGE_PERCENT = (STORAGE_USED_GB / STORAGE_TOTAL_GB) * 100

type LibrarySidebarFooterProps = {
  userName?: string
}

const getAvatarInitial = (name: string): string => {
  const trimmed = name.replace(/님$/, "").trim()
  if (!trimmed) return "학"
  return trimmed.slice(-1)
}

const getDisplayName = (name?: string): string => {
  if (!name) return "학습자"
  return name.replace(/님$/, "")
}

export const LibrarySidebarFooter = ({
  userName,
}: LibrarySidebarFooterProps) => {
  const displayName = getDisplayName(userName)
  const initial = getAvatarInitial(displayName)

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
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="설정"
        >
          <Settings className="size-icon-md" />
        </Button>
      </div>
    </div>
  )
}
