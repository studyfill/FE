export type ExplanationPoint = {
  id: string
  text: string
  sourcePage: number
}

export type LectureExplanation = {
  materialId: string
  generatedAt: string
  coreConcepts: ExplanationPoint[]
  examHighlights: ExplanationPoint[]
  confusionPoints: ExplanationPoint[]
}
