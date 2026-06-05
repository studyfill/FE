export type ExplanationPoint = {
  id: string
  text: string
  sourcePage: number
}

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

export type LectureExplanation = {
  materialId: string
  generatedAt: string
  options?: ExplanationGenerateOptions
  coreConcepts: ExplanationPoint[]
  examHighlights: ExplanationPoint[]
  confusionPoints: ExplanationPoint[]
}
