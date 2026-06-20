"use client"

import { useCallback, useEffect, useState } from "react"

import {
  generateNote,
  getNote,
} from "@/lib/mocks/note"
import {
  DEFAULT_NOTE_OPTIONS,
  type NoteGenerateOptions,
  type LectureNote,
} from "@/types/note"

export const useNote = (userFileId: string) => {
  const [note, setNote] = useState<LectureNote | null>(null)
  const [options, setOptions] = useState<NoteGenerateOptions>(
    DEFAULT_NOTE_OPTIONS
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    const stored = getNote(userFileId)
    setNote(stored)
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
      const result = await generateNote(userFileId, options)
      setNote(result)
    } catch (err) {
      console.error("[note] generate failed:", err)
      setError("generate_failed")
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    note,
    options,
    setOptions,
    isGenerating,
    error,
    handleGenerate,
    clearError,
    refresh,
  }
}
