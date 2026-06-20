"use client"

import { useCallback, useMemo, useState } from "react"

import {
  getNoteEdits,
  saveNoteFieldEdit,
} from "@/lib/mocks/note-edits"
import type { NoteFieldEdits } from "@/types/note"

export const useNoteEdits = (
  userFileId: string,
  generatedAt: string
) => {
  const [fields, setFields] = useState<NoteFieldEdits>(() =>
    getNoteEdits(userFileId, generatedAt)
  )

  const getFieldHtml = useCallback(
    (fieldKey: string) => fields[fieldKey],
    [fields]
  )

  const saveFieldHtml = useCallback(
    (fieldKey: string, html: string) => {
      setFields((prev) => ({ ...prev, [fieldKey]: html }))
      saveNoteFieldEdit(userFileId, generatedAt, fieldKey, html)
    },
    [userFileId, generatedAt]
  )

  const hasEdits = useMemo(() => Object.keys(fields).length > 0, [fields])

  return { getFieldHtml, saveFieldHtml, hasEdits }
}
