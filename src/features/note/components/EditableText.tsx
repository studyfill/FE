"use client"

import { useEffect, useRef } from "react"

import { useNoteEdit } from "@/features/note/context/NoteEditContext"
import { cn } from "@/lib/utils"

type EditableTextProps = {
  fieldKey: string
  defaultText: string
  className?: string
  /** Dark cheat-sheet panel — pen colors stay readable */
  variant?: "default" | "dark"
}

export const EditableText = ({
  fieldKey,
  defaultText,
  className,
  variant = "default",
}: EditableTextProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const { getFieldHtml, saveFieldHtml } = useNoteEdit()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current || !ref.current) return

    const saved = getFieldHtml(fieldKey)
    ref.current.innerHTML = saved ?? defaultText
    initializedRef.current = true
  }, [fieldKey, defaultText, getFieldHtml])

  const handleSave = () => {
    if (!ref.current) return
    saveFieldHtml(fieldKey, ref.current.innerHTML)
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-editable-field={fieldKey}
      className={cn(
        "outline-none selection:bg-primary/15",
        "rounded-sm transition-colors focus-visible:bg-primary/[0.03]",
        variant === "dark" && "ex-editable-dark",
        className
      )}
      onInput={handleSave}
      onBlur={handleSave}
      role="textbox"
      aria-multiline="true"
      spellCheck={false}
    />
  )
}
