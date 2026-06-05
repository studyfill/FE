import type {
  ExplanationGenerateOptions,
  LectureExplanation,
} from "@/types/explanation"

import { getMaterial } from "./materials"
import { loadMockStore, saveMockStore } from "./mock-store"

export const getExplanation = (materialId: string): LectureExplanation | null => {
  const store = loadMockStore()
  return store.explanations[materialId] ?? null
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
    options,
    coreConcepts: [
      {
        id: "c1",
        text: "프로세스는 실행 중인 프로그램이며, 스레드는 프로세스 안에서 실행되는 작업 단위입니다.",
        sourcePage: 3,
      },
      {
        id: "c2",
        text: "CPU 스케줄링은 준비 큐에 있는 프로세스 중 다음에 실행할 프로세스를 고르는 것입니다.",
        sourcePage: 7,
      },
    ],
    examHighlights: [
      {
        id: "e1",
        text: "FCFS, SJF, Round Robin의 특징과 starvation 발생 조건을 비교할 수 있어야 합니다.",
        sourcePage: 9,
      },
      {
        id: "e2",
        text: "문맥 교환(context switch) 비용이 왜 성능에 영향을 주는지 설명할 수 있어야 합니다.",
        sourcePage: 11,
      },
    ],
    confusionPoints: [
      {
        id: "x1",
        text: "프로세스 vs 스레드: 메모리 공유 범위와 생성 비용이 다릅니다.",
        sourcePage: 4,
      },
      {
        id: "x2",
        text: "선점형 vs 비선점형 스케줄링: CPU를 강제로 빼앗을 수 있는지가 핵심 구분입니다.",
        sourcePage: 8,
      },
    ],
  }

  const store = loadMockStore()
  store.explanations[materialId] = explanation
  saveMockStore(store)

  return explanation
}
