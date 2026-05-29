"use client"

import { useCallback, useEffect, useState } from "react"

import {
  generateExplanation,
  getExplanation,
} from "@/lib/mocks/explanation"
import type { LectureExplanation } from "@/types/explanation"

export const useExplanation = (materialId: string) => {
  const [explanation, setExplanation] = useState<LectureExplanation | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [highlightPage, setHighlightPage] = useState<number | null>(null)

  const refresh = useCallback(() => {
    setExplanation(getExplanation(materialId))
  }, [materialId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const result = await generateExplanation(materialId)
      setExplanation(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "설명 생성에 실패했습니다.")
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    explanation,
    isGenerating,
    error,
    highlightPage,
    setHighlightPage,
    handleGenerate,
    refresh,
  }
}
