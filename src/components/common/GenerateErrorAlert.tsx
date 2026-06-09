"use client"

import { RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type GenerateErrorAlertProps = {
  onRetry: () => void
  isRetrying?: boolean
  className?: string
}

export const GenerateErrorAlert = ({
  onRetry,
  isRetrying = false,
  className,
}: GenerateErrorAlertProps) => {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-center justify-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3",
        className
      )}
    >
      <p className="text-body-sm text-destructive">분석에 실패했습니다</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 rounded-button border-destructive/30 text-destructive hover:bg-destructive/10"
        onClick={onRetry}
        disabled={isRetrying}
        aria-label="분석 재시도"
      >
        <RotateCcw
          className={cn("size-3.5", isRetrying && "animate-spin")}
          strokeWidth={2}
        />
        재시도
      </Button>
    </div>
  )
}
