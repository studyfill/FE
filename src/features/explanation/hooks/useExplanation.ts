"use client"

import { useCallback, useEffect, useState } from "react"

import {
  generateExplanation,
  getExplanation,
} from "@/lib/mocks/explanation"
import {
  DEFAULT_EXPLANATION_OPTIONS,
  type ExplanationGenerateOptions,
  type LectureExplanation,
} from "@/types/explanation"

export const useExplanation = (materialId: string) => {
  const [explanation, setExplanation] = useState<LectureExplanation | null>(null)
  const [options, setOptions] = useState<ExplanationGenerateOptions>(
    DEFAULT_EXPLANATION_OPTIONS
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    const stored = getExplanation(materialId)
    setExplanation(stored)
    if (stored?.options) {
      setOptions(stored.options)
    }
  }, [materialId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const clearError = () => setError(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const result = await generateExplanation(materialId, options)
      setExplanation(result)
    } catch (err) {
      console.error("[explanation] generate failed:", err)
      setError("generate_failed")
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    explanation,
    options,
    setOptions,
    isGenerating,
    error,
    handleGenerate,
    clearError,
    refresh,
  }
}
