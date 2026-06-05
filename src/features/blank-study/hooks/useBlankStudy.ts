"use client"

import { useCallback, useEffect, useState } from "react"

import {
  generateBlankItems,
  getBlankItems,
  resetIncorrectBlankItems,
  updateBlankItem,
} from "@/lib/mocks/blank-study"
import { updateMaterial } from "@/lib/mocks/materials"
import type { BlankItem } from "@/types/blank-study"

export const useBlankStudy = (materialId: string) => {
  const [items, setItems] = useState<BlankItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const refresh = useCallback(() => {
    setItems(getBlankItems(materialId))
  }, [materialId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const result = await generateBlankItems(materialId)
      setItems(result)
      setAnswers({})
    } catch (err) {
      setError(err instanceof Error ? err.message : "빈칸 생성에 실패했습니다.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = (itemId: string) => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return

    const raw = answers[itemId]?.trim() ?? ""
    const isCorrect =
      raw.toLowerCase() === item.answer.toLowerCase() ||
      raw.replace(/\s/g, "") === item.answer.replace(/\s/g, "")

    const updated = updateBlankItem(materialId, itemId, {
      status: isCorrect ? "correct" : "incorrect",
    })
    setItems(updated)

    const done = updated.filter((i) => i.status === "correct").length
    const progress = updated.length
      ? Math.round((done / updated.length) * 100)
      : 0
    updateMaterial(materialId, { progressPercent: progress })
  }

  const handleRetryIncorrect = () => {
    const updated = resetIncorrectBlankItems(materialId)
    setItems(updated)
    const nextAnswers = { ...answers }
    updated.forEach((item) => {
      if (item.status === "pending") {
        nextAnswers[item.id] = ""
      }
    })
    setAnswers(nextAnswers)
  }

  const setAnswer = (itemId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [itemId]: value }))
  }

  const completedCount = items.filter((i) => i.status === "correct").length
  const progressPercent = items.length
    ? Math.round((completedCount / items.length) * 100)
    : 0

  return {
    items,
    answers,
    isGenerating,
    error,
    completedCount,
    progressPercent,
    handleGenerate,
    handleSubmit,
    handleRetryIncorrect,
    setAnswer,
    refresh,
  }
}
