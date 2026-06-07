"use client"

import { useCallback, useEffect, useState } from "react"

import { getExplanation } from "@/lib/mocks/explanation"
import {
  addCustomBlankItem,
  generateBlankSession,
  getBlankSession,
  removeBlankItem,
  resetIncorrectBlankItems,
  updateBlankItem,
} from "@/lib/mocks/blank-study"
import { updateMaterial } from "@/lib/mocks/materials"
import {
  DEFAULT_BLANK_OPTIONS,
  type BlankGenerateOptions,
  type BlankStudySession,
} from "@/types/blank-study"
import type { CustomBlankTarget } from "@/lib/blank-study/add-custom-blank"

export const useBlankStudy = (materialId: string) => {
  const [session, setSession] = useState<BlankStudySession | null>(null)
  const [options, setOptions] = useState<BlankGenerateOptions>(
    DEFAULT_BLANK_OPTIONS
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [customBlankMode, setCustomBlankMode] = useState(false)

  const hasExplanation = Boolean(getExplanation(materialId))

  const refresh = useCallback(() => {
    const stored = getBlankSession(materialId)
    setSession(stored)
    if (stored?.options) {
      setOptions(stored.options)
    }
  }, [materialId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const result = await generateBlankSession(materialId, options)
      setSession(result)
      setAnswers({})
      setCustomBlankMode(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "빈칸 생성에 실패했습니다.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = (itemId: string) => {
    const item = session?.items.find((i) => i.id === itemId)
    if (!item) return

    const raw = answers[itemId]?.trim() ?? ""
    const isCorrect =
      raw.toLowerCase() === item.answer.toLowerCase() ||
      raw.replace(/\s/g, "") === item.answer.replace(/\s/g, "")

    const updated = updateBlankItem(materialId, itemId, {
      status: isCorrect ? "correct" : "incorrect",
    })
    if (updated) setSession(updated)

    const blankOnly = (updated?.items ?? []).filter((item) => !item.isTextOnly)
    const done = blankOnly.filter((i) => i.status === "correct").length
    const progress = blankOnly.length
      ? Math.round((done / blankOnly.length) * 100)
      : 0
    updateMaterial(materialId, { progressPercent: progress })
  }

  const handleRetryIncorrect = () => {
    const updated = resetIncorrectBlankItems(materialId)
    if (!updated) return
    setSession(updated)
    const nextAnswers = { ...answers }
    updated.items.forEach((item) => {
      if (item.status === "pending") {
        nextAnswers[item.id] = ""
      }
    })
    setAnswers(nextAnswers)
  }

  const setAnswer = (itemId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [itemId]: value }))
  }

  const handleAddCustomBlank = (target: CustomBlankTarget) => {
    const updated = addCustomBlankItem(materialId, target)
    if (!updated) return
    setSession(updated)
  }

  const handleRemoveBlank = (itemId: string) => {
    const updated = removeBlankItem(materialId, itemId)
    if (updated === null) {
      setSession(null)
      setAnswers({})
      updateMaterial(materialId, { progressPercent: 0 })
      return
    }

    setSession(updated)
    setAnswers((prev) => {
      const next = { ...prev }
      delete next[itemId]
      return next
    })

    const blankItems = updated.items.filter((item) => !item.isTextOnly)
    const done = blankItems.filter((item) => item.status === "correct").length
    const progress = blankItems.length
      ? Math.round((done / blankItems.length) * 100)
      : 0
    updateMaterial(materialId, { progressPercent: progress })
  }

  const allItems = session?.items ?? []
  const blankItems = allItems.filter((item) => !item.isTextOnly)
  const completedCount = blankItems.filter((i) => i.status === "correct").length
  const progressPercent = blankItems.length
    ? Math.round((completedCount / blankItems.length) * 100)
    : 0

  return {
    session,
    items: blankItems,
    allItems,
    options,
    setOptions,
    hasExplanation,
    answers,
    isGenerating,
    error,
    completedCount,
    progressPercent,
    handleGenerate,
    handleSubmit,
    handleRetryIncorrect,
    setAnswer,
    customBlankMode,
    setCustomBlankMode,
    handleAddCustomBlank,
    handleRemoveBlank,
    refresh,
  }
}
