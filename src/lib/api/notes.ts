// 노트(note) 백엔드 연동. files 도메인과 동일하게 BFF 라우트(src/app/api/files/[fileId]/notes/**)
// 경유로 same-origin 호출한다(bffFetch — 토큰은 서버 세션 쿠키에서만 읽힘).
//
// 생성은 비동기다: POST /generate 로 접수(noteId) → GET /{noteId}/status 폴링 → 완료 시 GET /{noteId} 로 상세.
// note 도메인은 아직 배포 백엔드 OpenAPI(schema.d.ts)에 없어 계약 타입을 여기서 직접 정의한다.
// (계약 출처: 로컬 be `note` 컨트롤러/DTO + ai-worker NoteResult 스키마)

import { ApiError, ErrorCode } from "./errors"
import { bffFetch } from "./client"
import type {
  LectureNote,
  LectureNoteContent,
  NoteFieldEdits,
  NoteGenerateOptions,
  NoteStatus,
  NoteStyle,
} from "@/types/note"

// ── 백엔드 계약 타입 (ApiResponse<T>.data) ──────────────────────────
type JobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"

/** POST /generate 접수 응답. 클라는 noteId 로 상태/상세를 폴링한다. */
type NoteGenerateResponse = {
  noteId: string
  jobId: string
  status: JobStatus
}

/** GET /{noteId}/status — errorMessage 는 FAILED 일 때만 채워진다. */
type NoteStatusResponse = {
  noteId: string
  status: NoteStatus
  errorMessage: string | null
}

/** GET (목록) 항목 — 본문 제외. MVP 는 파일당 최대 1건. */
type NoteSummary = {
  id: string
  style: NoteStyle
  status: NoteStatus
  createdAt: string
  updatedAt: string
}

/** GET /{noteId} — content/fieldEdits 는 @JsonRawValue 로 임베드된 객체. 생성 중이면 content 는 null. */
type NoteDetailResponse = {
  id: string
  fileId: string
  style: NoteStyle
  content: LectureNoteContent | null
  fieldEdits: NoteFieldEdits | null
  status: NoteStatus
  createdAt: string
  updatedAt: string
}

/** PUT /{noteId} 요청 — 전달된 필드만 부분 갱신. */
type NoteUpdateRequest = {
  content?: LectureNoteContent
  fieldEdits?: NoteFieldEdits
}

// ── 옵션/응답 매핑 ──────────────────────────────────────────────
type NoteGenerateRequest = {
  style: NoteStyle
  pageRange: { start: number; end: number } | null
}

const toGenerateRequest = (
  options: NoteGenerateOptions,
): NoteGenerateRequest => ({
  style: options.difficulty === "explanation" ? "EXPLANATION" : "SUMMARY",
  // 범위=페이지 지정 + 시작/끝 모두 입력됐을 때만 pageRange 전송. 전체(all)면 null(문서 전체).
  pageRange:
    options.range === "page" &&
    options.pageStart != null &&
    options.pageEnd != null
      ? { start: options.pageStart, end: options.pageEnd }
      : null,
})

/** 백엔드 NoteDetailResponse → FE LectureNote. content 가 없으면(생성 중) null. */
export const toLectureNote = (detail: NoteDetailResponse): LectureNote | null => {
  if (!detail.content) return null
  return {
    ...detail.content,
    userFileId: detail.fileId,
    generatedAt: detail.updatedAt,
    style: detail.style,
  }
}

// ── API 호출 ────────────────────────────────────────────────────
export const generateNote = (
  fileId: string,
  options: NoteGenerateOptions,
): Promise<NoteGenerateResponse> =>
  bffFetch<NoteGenerateResponse>(`/files/${fileId}/notes/generate`, {
    method: "POST",
    body: toGenerateRequest(options),
  })

export const getNoteStatus = (
  fileId: string,
  noteId: string,
): Promise<NoteStatusResponse> =>
  bffFetch<NoteStatusResponse>(`/files/${fileId}/notes/${noteId}/status`)

export const getNoteDetail = (
  fileId: string,
  noteId: string,
): Promise<NoteDetailResponse> =>
  bffFetch<NoteDetailResponse>(`/files/${fileId}/notes/${noteId}`)

export const listNotes = (fileId: string): Promise<NoteSummary[]> =>
  bffFetch<NoteSummary[]>(`/files/${fileId}/notes`)

export const updateNote = (
  fileId: string,
  noteId: string,
  patch: NoteUpdateRequest,
): Promise<NoteDetailResponse> =>
  bffFetch<NoteDetailResponse>(`/files/${fileId}/notes/${noteId}`, {
    method: "PUT",
    body: patch,
  })

export const deleteNote = (fileId: string, noteId: string): Promise<void> =>
  bffFetch<void>(`/files/${fileId}/notes/${noteId}`, { method: "DELETE" })

// ── 폴링 ────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 120000

const delay = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("aborted", "AbortError"))
      return
    }
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer)
        reject(new DOMException("aborted", "AbortError"))
      },
      { once: true },
    )
  })

/**
 * status 를 COMPLETED/FAILED 가 될 때까지 폴링한다.
 * 타임아웃(~2분) 시 ApiError, 취소(signal) 시 AbortError 를 throw.
 */
export const pollNoteStatus = async (
  fileId: string,
  noteId: string,
  signal?: AbortSignal,
): Promise<NoteStatusResponse> => {
  const deadline = Date.now() + POLL_TIMEOUT_MS
  for (;;) {
    const status = await getNoteStatus(fileId, noteId)
    if (status.status !== "GENERATING") return status
    if (Date.now() >= deadline) {
      throw new ApiError(
        ErrorCode.COMMON_INTERNAL_ERROR,
        "생성이 지연되고 있어요. 잠시 후 다시 시도해 주세요.",
        408,
      )
    }
    await delay(POLL_INTERVAL_MS, signal)
  }
}

/** ApiError.code → 사용자 표시 메시지 (raw 에러 미노출). */
export const noteErrorMessage = (err: unknown): string => {
  if (err instanceof ApiError) {
    switch (err.code) {
      case ErrorCode.AI_ANALYSIS_REQUIRED:
        return "텍스트 분석이 끝난 뒤 노트를 생성할 수 있어요."
      case ErrorCode.AI_JOB_IN_PROGRESS:
        return "이미 노트 생성이 진행 중이에요. 잠시만 기다려 주세요."
      case ErrorCode.NOTE_NOT_COMPLETED:
        return "생성이 끝난 뒤 편집할 수 있어요."
      case ErrorCode.NOTE_NOT_FOUND:
        return "노트를 찾을 수 없어요."
      case ErrorCode.AI_GENERATION_FAILED:
      case ErrorCode.AI_WORKER_UNAVAILABLE:
        return "노트 생성에 실패했어요. 잠시 후 다시 시도해 주세요."
    }
    return err.message || "노트 생성에 실패했어요."
  }
  return "노트 생성에 실패했어요."
}
