export type ExplanationRange = "all" | "chapter" | "page"
export type ExplanationFormat = "lecture-notes" | "bullet-points" | "exam-prep"
export type ExplanationDifficulty = "easy" | "detailed"

export type ExplanationGenerateOptions = {
  range: ExplanationRange
  format: ExplanationFormat
  difficulty: ExplanationDifficulty
}

export const DEFAULT_EXPLANATION_OPTIONS: ExplanationGenerateOptions = {
  range: "chapter",
  format: "lecture-notes",
  difficulty: "easy",
}

export type ExplanationConceptBlock = {
  id: string
  title: string
  body: string
  sourcePage: number
}

export type ExplanationExample = {
  id: string
  title: string
  body: string
  sourcePage: number
}

export type ExplanationExamItem = {
  id: string
  title: string
  hint: string
  sourcePage: number
}

export type ExplanationConfusionItem = {
  id: string
  category: string
  comparison: string
  body: string
}

export type ExplanationCheatSheetRow = {
  label: string
  middle: string
  right: string
}

export type ExplanationCheatSheet = {
  formulas: string[]
  rows: ExplanationCheatSheetRow[]
}

export type LectureExplanation = {
  materialId: string
  generatedAt: string
  options?: ExplanationGenerateOptions
  title: string
  estimatedMinutes: number
  accuracyPercent: number
  learningGoals: string[]
  coreConcepts: ExplanationConceptBlock[]
  examples: ExplanationExample[]
  examHighlights: ExplanationExamItem[]
  confusionPoints: ExplanationConfusionItem[]
  selfCheckQuestions: string[]
  cheatSheet: ExplanationCheatSheet
}

/** fieldKey → HTML (user annotations: bold, highlight, pen color) */
export type ExplanationFieldEdits = Record<string, string>

export type ExplanationEdits = {
  generatedAt: string
  fields: ExplanationFieldEdits
}
