export type NoteRange = "all" | "chapter" | "page"
export type NoteFormat = "lecture-notes" | "bullet-points" | "exam-prep"
export type NoteDifficulty = "easy" | "detailed"

export type NoteGenerateOptions = {
  range: NoteRange
  format: NoteFormat
  difficulty: NoteDifficulty
}

export const DEFAULT_NOTE_OPTIONS: NoteGenerateOptions = {
  range: "chapter",
  format: "lecture-notes",
  difficulty: "easy",
}

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

export type LectureNote = {
  userFileId: string
  generatedAt: string
  options?: NoteGenerateOptions
  title: string
  estimatedMinutes: number
  accuracyPercent: number
  learningGoals: string[]
  coreConcepts: NoteConceptBlock[]
  examples: NoteExample[]
  examHighlights: NoteExamItem[]
  confusionPoints: NoteConfusionItem[]
  selfCheckQuestions: string[]
  cheatSheet: NoteCheatSheet
}

/** fieldKey → HTML (user annotations: bold, highlight, pen color) */
export type NoteFieldEdits = Record<string, string>

export type NoteEdits = {
  generatedAt: string
  fields: NoteFieldEdits
}
