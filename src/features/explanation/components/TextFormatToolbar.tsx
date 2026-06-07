"use client"

import {
  Bold,
  Eraser,
  Highlighter,
  Italic,
  LineSquiggle,
  Minus,
  MoreHorizontal,
  PenLine,
  Underline,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { createPortal } from "react-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  applyBold,
  applyHighlight,
  applyItalic,
  applyPenColor,
  applyPenUnderline,
  getSelectionRect,
  removeFormatting,
  syncSavedSelection,
  type HighlightColor,
  type PenColor,
  type UnderlineStyle,
} from "@/features/explanation/utils/text-format"

/** 형광펜: 노랑 → 초록 → 파랑 → 분홍 */
const HIGHLIGHT_OPTIONS: { color: HighlightColor; label: string; swatch: string }[] = [
  { color: "yellow", label: "노란 하이라이트", swatch: "bg-[#fde68a]" },
  { color: "green", label: "초록 하이라이트", swatch: "bg-[#86efac]" },
  { color: "blue", label: "파란 하이라이트", swatch: "bg-[#93c5fd]" },
  { color: "pink", label: "분홍 하이라이트", swatch: "bg-[#f9a8d4]" },
]

/** 색깔펜·밑줄: 같은 슬롯 순서 (따뜻한색 → 초록 → 파랑 → 보라) */
const PEN_OPTIONS: { color: PenColor; label: string; swatch: string; hex: string }[] = [
  { color: "red", label: "빨간 펜", swatch: "bg-[#ef4444]", hex: "#ef4444" },
  { color: "green", label: "초록 펜", swatch: "bg-[#22c55e]", hex: "#22c55e" },
  { color: "blue", label: "파란 펜", swatch: "bg-[#3b82f6]", hex: "#3b82f6" },
  { color: "purple", label: "보라 펜", swatch: "bg-[#a855f7]", hex: "#a855f7" },
]

const UNDERLINE_OPTIONS: {
  style: UnderlineStyle
  label: string
  icon: typeof Minus
  className?: string
}[] = [
  { style: "solid", label: "직선 밑줄", icon: Minus },
  { style: "wavy", label: "물결 밑줄", icon: LineSquiggle },
  { style: "double", label: "이중 밑줄", icon: Minus, className: "border-b-2 border-current" },
  { style: "dotted", label: "점선 밑줄", icon: MoreHorizontal },
]

const PEN_SWATCH_BUTTON_CLASS =
  "size-5 rounded-full border-2 border-white ring-1 ring-border/60 transition-transform hover:scale-110"

type ToolbarPosition = { top: number; left: number }

export const TextFormatToolbar = () => {
  const [position, setPosition] = useState<ToolbarPosition | null>(null)
  const [mounted, setMounted] = useState(false)
  const [lastPenColor, setLastPenColor] = useState<PenColor>("red")
  const [lastUnderlineStyle, setLastUnderlineStyle] =
    useState<UnderlineStyle>("solid")

  const activePenHex =
    PEN_OPTIONS.find((option) => option.color === lastPenColor)?.hex ?? "#ef4444"

  useEffect(() => {
    setMounted(true)
  }, [])

  const updatePosition = useCallback(() => {
    const rect = getSelectionRect()
    if (!rect || rect.width === 0) {
      setPosition(null)
      return
    }

    const toolbarWidth = 440
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - toolbarWidth / 2, 8),
      window.innerWidth - toolbarWidth - 8
    )
    const top = Math.max(rect.top - 56, 8)

    setPosition({ top, left })
  }, [])

  useEffect(() => {
    const handleSelectionChange = () => {
      syncSavedSelection()
      requestAnimationFrame(updatePosition)
    }

    document.addEventListener("selectionchange", handleSelectionChange)
    window.addEventListener("resize", handleSelectionChange)
    window.addEventListener("scroll", handleSelectionChange, true)

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange)
      window.removeEventListener("resize", handleSelectionChange)
      window.removeEventListener("scroll", handleSelectionChange, true)
    }
  }, [updatePosition])

  const handleFormat = (action: () => void) => {
    syncSavedSelection()
    action()
    requestAnimationFrame(updatePosition)
  }

  if (!mounted || !position) return null

  return createPortal(
    <div
      className="fixed z-50 flex max-w-[28rem] flex-wrap items-center gap-0.5 rounded-xl border border-border bg-background/95 p-1 shadow-lg backdrop-blur-sm"
      style={{ top: position.top, left: position.left }}
      role="toolbar"
      aria-label="텍스트 서식"
      onMouseDown={(event) => {
        syncSavedSelection()
        event.preventDefault()
      }}
    >
      <ToolbarButton
        label="굵게"
        onClick={() => handleFormat(applyBold)}
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="기울임"
        onClick={() => handleFormat(applyItalic)}
      >
        <Italic className="size-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <div className="flex items-center gap-0.5 px-0.5" title="하이라이트">
        <Highlighter className="mx-0.5 size-3.5 text-muted-foreground" />
        {HIGHLIGHT_OPTIONS.map((option) => (
          <button
            key={option.color}
            type="button"
            aria-label={option.label}
            className={cn(
              "size-5 rounded-full border border-border/60 transition-transform hover:scale-110",
              option.swatch
            )}
            onClick={() => handleFormat(() => applyHighlight(option.color))}
          />
        ))}
      </div>

      <ToolbarDivider />

      <div className="flex items-center gap-0.5 px-0.5" title="색깔펜">
        <PenLine className="mx-0.5 size-3.5 text-muted-foreground" />
        {PEN_OPTIONS.map((option) => (
          <button
            key={option.color}
            type="button"
            aria-label={option.label}
            className={cn(PEN_SWATCH_BUTTON_CLASS, option.swatch)}
            onClick={() =>
              handleFormat(() => {
                setLastPenColor(option.color)
                applyPenColor(option.color)
              })
            }
          />
        ))}
      </div>

      <ToolbarDivider />

      <div className="flex items-center gap-0.5 px-0.5" title="펜 밑줄">
        <Underline className="mx-0.5 size-3.5 text-muted-foreground" />
        {PEN_OPTIONS.map((option) => (
          <button
            key={`underline-${option.color}`}
            type="button"
            aria-label={`${option.label} 밑줄 색`}
            aria-pressed={lastPenColor === option.color}
            className={cn(
              PEN_SWATCH_BUTTON_CLASS,
              option.swatch,
              lastPenColor === option.color && "ring-2 ring-foreground/40"
            )}
            onClick={() => setLastPenColor(option.color)}
          />
        ))}
        <span className="mx-0.5 h-5 w-px bg-border/80" aria-hidden />
        {UNDERLINE_OPTIONS.map((option) => {
          const Icon = option.icon
          return (
            <button
              key={option.style}
              type="button"
              aria-label={option.label}
              className={cn(
                "flex size-7 items-center justify-center rounded-md transition-colors hover:bg-muted",
                option.className,
                lastUnderlineStyle === option.style && "bg-muted"
              )}
              style={{ color: activePenHex }}
              onClick={() =>
                handleFormat(() => {
                  setLastUnderlineStyle(option.style)
                  applyPenUnderline(lastPenColor, option.style)
                })
              }
            >
              <Icon className="size-3.5" />
            </button>
          )
        })}
      </div>

      <ToolbarDivider />

      <ToolbarButton
        label="서식 제거"
        onClick={() => handleFormat(removeFormatting)}
      >
        <Eraser className="size-4" />
      </ToolbarButton>
    </div>,
    document.body
  )
}

const ToolbarButton = ({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icon-sm"
    className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
    aria-label={label}
    onClick={onClick}
  >
    {children}
  </Button>
)

const ToolbarDivider = () => (
  <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />
)
