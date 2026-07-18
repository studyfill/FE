export type NoteRange = "all" | "page"
export type NoteDifficulty = "summary" | "explanation"

export type NoteGenerateOptions = {
  range: NoteRange
  difficulty: NoteDifficulty
  /** range === "page" 일 때만 사용. 전체(all)이면 null. */
  pageStart: number | null
  pageEnd: number | null
}

export const DEFAULT_NOTE_OPTIONS: NoteGenerateOptions = {
  range: "all",
  difficulty: "summary",
  pageStart: null,
  pageEnd: null,
}

/** 백엔드 NoteStyle 과 1:1 (difficulty "explanation" → "EXPLANATION", 그 외 → "SUMMARY"). */
export type NoteStyle = "SUMMARY" | "EXPLANATION"

/** 백엔드 NoteStatus (생성 상태). */
export type NoteStatus = "GENERATING" | "COMPLETED" | "FAILED"

export type NoteConceptBlock = {
  id: string
  title: string
  body: string
  sourcePage: number
}

export type NoteExample = {
  id: string
  title: string
  body: string
  sourcePage: number
}

export type NoteExamItem = {
  id: string
  title: string
  hint: string
  sourcePage: number
}

export type NoteConfusionItem = {
  id: string
  category: string
  comparison: string
  body: string
}

export type NoteCheatSheetRow = {
  label: string
  middle: string
  right: string
}

export type NoteCheatSheet = {
  formulas: string[]
  rows: NoteCheatSheetRow[]
}

export type NoteMetadata = {
  processedPages: number
}

/**
 * 백엔드가 생성하는 고정 구조 본문 (ai-worker NoteResult 계약과 1:1).
 * NoteDetailResponse.content 로 내려오는 순수 콘텐츠 부분.
 */
export type LectureNoteContent = {
  title: string
  estimatedMinutes: number
  learningGoals: string[]
  coreConcepts: NoteConceptBlock[]
  examples: NoteExample[]
  examHighlights: NoteExamItem[]
  confusionPoints: NoteConfusionItem[]
  selfCheckQuestions: string[]
  cheatSheet: NoteCheatSheet
  metadata: NoteMetadata
}

/**
 * FE 에서 다루는 노트 = content(LectureNoteContent) + 래퍼 메타데이터.
 * - `style`: 백엔드 경로에서 채움(난이도 라벨용). mock 은 `options` 로 대체.
 * - `accuracyPercent`: 실제 content 계약엔 없음 → 옵셔널(landing/mock 프리뷰만 사용).
 * - `metadata`: 실제엔 있으나 UI 필수 아님 → 옵셔널(mock 미제공).
 */
export type LectureNote = {
  userFileId: string
  generatedAt: string
  options?: NoteGenerateOptions
  style?: NoteStyle
  title: string
  estimatedMinutes: number
  accuracyPercent?: number
  learningGoals: string[]
  coreConcepts: NoteConceptBlock[]
  examples: NoteExample[]
  examHighlights: NoteExamItem[]
  confusionPoints: NoteConfusionItem[]
  selfCheckQuestions: string[]
  cheatSheet: NoteCheatSheet
  metadata?: NoteMetadata
}

/** fieldKey → HTML (user annotations: bold, highlight, pen color) */
export type NoteFieldEdits = Record<string, string>

export type NoteEdits = {
  generatedAt: string
  fields: NoteFieldEdits
}
