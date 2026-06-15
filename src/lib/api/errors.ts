// 백엔드 ERROR_CODE.md 와 1:1 대응. 백엔드 코드가 바뀌면 이 파일도 함께 갱신한다.
// (코드 문자열만 있으면 분기에 충분하므로 enum 대신 const 객체로 관리)

/** apiFetch 가 던지는 표준 에러. code 로 분기한다. */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/** 백엔드 응답 공통 래퍼 */
export type ApiResponse<T> = {
  success: boolean
  data: T | null
  code: string
  message: string
}

/** 목록(페이지네이션) 응답 data 구조 */
export type Page<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

/** 에러 코드 상수 (ERROR_CODE.md 전체) */
export const ErrorCode = {
  // AUTH
  AUTH_UNAUTHORIZED: "AUTH_001",
  AUTH_TOKEN_EXPIRED: "AUTH_002",
  AUTH_INVALID_TOKEN: "AUTH_003",
  AUTH_LOGGED_OUT_TOKEN: "AUTH_004",
  AUTH_ACCESS_DENIED: "AUTH_005",
  AUTH_GOOGLE_FAILED: "AUTH_006",
  AUTH_INVALID_REFRESH: "AUTH_007",

  // USER
  USER_NOT_FOUND: "USER_001",

  // FOLDER
  FOLDER_NOT_FOUND: "FOLDER_001",
  FOLDER_CIRCULAR_MOVE: "FOLDER_002",
  FOLDER_NAME_DUPLICATE: "FOLDER_003",
  FOLDER_DEPTH_EXCEEDED: "FOLDER_004",

  // FILE
  FILE_NOT_FOUND: "FILE_001",
  FILE_UNSUPPORTED_TYPE: "FILE_002",
  FILE_SIZE_EXCEEDED: "FILE_003",
  FILE_PAGE_EXCEEDED: "FILE_004",
  FILE_UPLOAD_FAILED: "FILE_005",
  FILE_COUNT_EXCEEDED: "FILE_006",
  FILE_STORAGE_EXCEEDED: "FILE_007",

  // AI
  AI_JOB_IN_PROGRESS: "AI_001",
  AI_GENERATION_FAILED: "AI_002",
  AI_JOB_NOT_FOUND: "AI_003",
  AI_ANALYSIS_REQUIRED: "AI_004",
  AI_WORKER_UNAVAILABLE: "AI_005",

  // NOTE
  NOTE_NOT_FOUND: "NOTE_001",
  NOTE_VERSION_LIMIT: "NOTE_002",
  NOTE_NOT_COMPLETED: "NOTE_003",

  // BLANK
  BLANK_NOT_FOUND: "BLANK_001",
  BLANK_EMPTY_ANSWERS: "BLANK_002",
  BLANK_VERSION_LIMIT: "BLANK_003",
  BLANK_NOT_COMPLETED: "BLANK_004",
  BLANK_ANSWER_COUNT_MISMATCH: "BLANK_005",

  // EXPORT
  EXPORT_NO_CONTENT: "EXPORT_001",
  EXPORT_PDF_FAILED: "EXPORT_002",

  // COMMON
  COMMON_INVALID_REQUEST: "COMMON_001",
  COMMON_INTERNAL_ERROR: "COMMON_002",
  COMMON_RATE_LIMIT: "COMMON_003",
  COMMON_NOT_FOUND: "COMMON_004",
  COMMON_METHOD_NOT_ALLOWED: "COMMON_005",
} as const

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode]

/** 인증 흐름에서 "재로그인 필요"로 처리할 코드 집합 */
export const REAUTH_REQUIRED_CODES: ReadonlySet<string> = new Set([
  ErrorCode.AUTH_UNAUTHORIZED,
  ErrorCode.AUTH_INVALID_TOKEN,
  ErrorCode.AUTH_LOGGED_OUT_TOKEN,
  ErrorCode.AUTH_INVALID_REFRESH,
])
