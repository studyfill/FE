"use client"

import { useCallback, useEffect, useState } from "react"

import { getNote } from "@/lib/mocks/note"
import { isBlankAnswerCorrect } from "@/lib/blank/normalize-answer"
import {
  addCustomBlankItem,
  generateBlankSession,
  getBlankSession,
  removeBlankItem,
  resetIncorrectBlankItems,
  saveBlankSession,
  updateBlankItem,
} from "@/lib/mocks/blank"
import { updateUserFile } from "@/lib/mocks/user-files"
import {
  DEFAULT_BLANK_OPTIONS,
  type BlankGenerateOptions,
  type BlankSession,
} from "@/types/blank"
import type { CustomBlankTarget } from "@/lib/blank/add-custom-blank"

export const useBlank = (userFileId: string) => {
  const [session, setSession] = useState<BlankSession | null>(null)
  const [options, setOptions] = useState<BlankGenerateOptions>(
    DEFAULT_BLANK_OPTIONS
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [customBlankMode, setCustomBlankMode] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const hasNote = Boolean(getNote(userFileId))

  const refresh = useCallback(() => {
    const stored = getBlankSession(userFileId)
    setSession(stored)
    if (stored?.options) {
      setOptions(stored.options)
    }
  }, [userFileId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const clearError = () => setError(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const result = await generateBlankSession(userFileId, options)
      setSession(result)
      setAnswers({})
      setCustomBlankMode(false)
      setIsDirty(false)
      setSaveMessage(null)
    } catch (err) {
      console.error("[blank] generate failed:", err)
      setError("generate_failed")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = (itemId: string) => {
    const item = session?.items.find((i) => i.id === itemId)
    if (!item) return

    const raw = answers[itemId]?.trim() ?? ""
    const isCorrect = isBlankAnswerCorrect(raw, item.answer)

    const updated = updateBlankItem(userFileId, itemId, {
      status: isCorrect ? "correct" : "incorrect",
    })
    if (updated) setSession(updated)

    const blankOnly = (updated?.items ?? []).filter((item) => !item.isTextOnly)
    const done = blankOnly.filter((i) => i.status === "correct").length
    const progress = blankOnly.length
      ? Math.round((done / blankOnly.length) * 100)
      : 0
    updateUserFile(userFileId, { progressPercent: progress })
  }

  const handleRetryIncorrect = () => {
    const updated = resetIncorrectBlankItems(userFileId)
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
    const updated = addCustomBlankItem(userFileId, target)
    if (!updated) return
    setSession(updated)
    setIsDirty(true)
    setSaveMessage(null)
  }

  const handleSaveSession = () => {
    const saved = saveBlankSession(userFileId)
    if (!saved) return
    setSession(saved)
    setIsDirty(false)
    setSaveMessage("빈칸 세션이 저장되었습니다.")
  }

  const handleRemoveBlank = (itemId: string) => {
    const updated = removeBlankItem(userFileId, itemId)
    if (updated === null) {
      setSession(null)
      setAnswers({})
      updateUserFile(userFileId, { progressPercent: 0 })
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
    updateUserFile(userFileId, { progressPercent: progress })
    setIsDirty(true)
    setSaveMessage(null)
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
    hasNote,
    answers,
    isGenerating,
    error,
    completedCount,
    progressPercent,
    handleGenerate,
    clearError,
    handleSubmit,
    handleRetryIncorrect,
    setAnswer,
    customBlankMode,
    setCustomBlankMode,
    handleAddCustomBlank,
    handleRemoveBlank,
    handleSaveSession,
    isDirty,
    saveMessage,
    refresh,
  }
}
