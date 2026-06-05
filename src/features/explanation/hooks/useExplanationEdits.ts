"use client"

import { useCallback, useMemo, useState } from "react"

import {
  getExplanationEdits,
  saveExplanationFieldEdit,
} from "@/lib/mocks/explanation-edits"
import type { ExplanationFieldEdits } from "@/types/explanation"

export const useExplanationEdits = (
  materialId: string,
  generatedAt: string
) => {
  const [fields, setFields] = useState<ExplanationFieldEdits>(() =>
    getExplanationEdits(materialId, generatedAt)
  )

  const getFieldHtml = useCallback(
    (fieldKey: string) => fields[fieldKey],
    [fields]
  )

  const saveFieldHtml = useCallback(
    (fieldKey: string, html: string) => {
      setFields((prev) => ({ ...prev, [fieldKey]: html }))
      saveExplanationFieldEdit(materialId, generatedAt, fieldKey, html)
    },
    [materialId, generatedAt]
  )

  const hasEdits = useMemo(() => Object.keys(fields).length > 0, [fields])

  return { getFieldHtml, saveFieldHtml, hasEdits }
}
