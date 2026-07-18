"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  generateNote,
  getNoteDetail,
  listNotes,
  noteErrorMessage,
  pollNoteStatus,
  toLectureNote,
} from "@/lib/api/notes"
import {
  DEFAULT_NOTE_OPTIONS,
  type LectureNote,
  type NoteGenerateOptions,
} from "@/types/note"

const isAbort = (err: unknown): boolean =>
  err instanceof DOMException && err.name === "AbortError"

export const useNote = (userFileId: string) => {
  const [note, setNote] = useState<LectureNote | null>(null)
  const [options, setOptions] = useState<NoteGenerateOptions>(
    DEFAULT_NOTE_OPTIONS
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 진행 중 폴링 취소용(언마운트 / 파일 전환 / 재생성 시 이전 폴링 중단)
  const abortRef = useRef<AbortController | null>(null)

  const clearError = useCallback(() => setError(null), [])

  // noteId 의 상태를 폴링 → 완료되면 상세를 불러 note 로 세팅한다. 폴링 동안 isGenerating 유지.
  const trackNote = useCallback(
    (noteId: string) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      const { signal } = controller

      setIsGenerating(true)
      setError(null)

      void (async () => {
        try {
          const status = await pollNoteStatus(userFileId, noteId, signal)
          if (signal.aborted) return
          if (status.status === "FAILED") {
            setError(status.errorMessage ?? noteErrorMessage(null))
            return
          }
          const detail = await getNoteDetail(userFileId, noteId)
          if (signal.aborted) return
          setNote(toLectureNote(detail))
        } catch (err) {
          if (signal.aborted || isAbort(err)) return
          console.error("[note] tracking failed:", err)
          setError(noteErrorMessage(err))
        } finally {
          if (!signal.aborted) setIsGenerating(false)
        }
      })()
    },
    [userFileId]
  )

  // 마운트 / 파일 전환 시 기존 노트 로드. GENERATING 이면 폴링 재개.
  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    void (async () => {
      try {
        const summaries = await listNotes(userFileId)
        if (signal.aborted) return
        const summary = summaries[0]
        if (!summary) return

        if (summary.status === "COMPLETED") {
          const detail = await getNoteDetail(userFileId, summary.id)
          if (signal.aborted) return
          setNote(toLectureNote(detail))
        } else if (summary.status === "GENERATING") {
          trackNote(summary.id)
        }
        // FAILED: 조용히 초기 상태 유지 → 사용자가 생성 버튼으로 재시도
      } catch (err) {
        if (signal.aborted || isAbort(err)) return
        console.error("[note] initial load failed:", err)
      }
    })()

    return () => {
      controller.abort()
      abortRef.current?.abort()
    }
  }, [userFileId, trackNote])

  const handleGenerate = async () => {
    abortRef.current?.abort()
    setIsGenerating(true)
    setError(null)
    try {
      const { noteId } = await generateNote(userFileId, options)
      trackNote(noteId)
    } catch (err) {
      console.error("[note] generate failed:", err)
      setError(noteErrorMessage(err))
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
  }
}
