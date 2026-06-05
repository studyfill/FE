import type {
  ExplanationGenerateOptions,
  LectureExplanation,
} from "@/types/explanation"

import { buildMockExplanation } from "./explanation-content"
import { getMaterial } from "./materials"
import { loadMockStore, saveMockStore } from "./mock-store"

const emptyCheatSheet = { formulas: [] as string[], rows: [] }

const normalizeExplanation = (
  explanation: Partial<LectureExplanation> & Pick<LectureExplanation, "materialId">
): LectureExplanation | null => {
  if (!explanation.title || !explanation.coreConcepts?.length) {
    return null
  }

  const firstConcept = explanation.coreConcepts[0]
  if (!("title" in firstConcept && "body" in firstConcept)) {
    return null
  }

  return {
    materialId: explanation.materialId,
    generatedAt: explanation.generatedAt ?? new Date().toISOString(),
    options: explanation.options,
    title: explanation.title,
    estimatedMinutes: explanation.estimatedMinutes ?? 8,
    accuracyPercent: explanation.accuracyPercent ?? 85,
    learningGoals: explanation.learningGoals ?? [],
    coreConcepts: explanation.coreConcepts as LectureExplanation["coreConcepts"],
    examples: explanation.examples ?? [],
    examHighlights: explanation.examHighlights ?? [],
    confusionPoints: explanation.confusionPoints ?? [],
    selfCheckQuestions: explanation.selfCheckQuestions ?? [],
    cheatSheet: explanation.cheatSheet ?? emptyCheatSheet,
  }
}

export const getExplanation = (materialId: string): LectureExplanation | null => {
  const store = loadMockStore()
  const stored = store.explanations[materialId]
  if (!stored) return null

  return normalizeExplanation(
    stored as Partial<LectureExplanation> & Pick<LectureExplanation, "materialId">
  )
}

export const generateExplanation = async (
  materialId: string,
  options: ExplanationGenerateOptions
): Promise<LectureExplanation> => {
  const material = getMaterial(materialId)
  if (!material) {
    throw new Error("자료를 찾을 수 없습니다.")
  }
  if (material.extractionStatus !== "done") {
    throw new Error("텍스트 추출이 완료된 후 설명을 생성할 수 있습니다.")
  }

  await new Promise((resolve) => setTimeout(resolve, 1200))

  const explanation: LectureExplanation = {
    materialId,
    generatedAt: new Date().toISOString(),
    ...buildMockExplanation(material, options),
  }

  const store = loadMockStore()
  store.explanations[materialId] = explanation
  delete store.explanationEdits[materialId]
  saveMockStore(store)

  return explanation
}
