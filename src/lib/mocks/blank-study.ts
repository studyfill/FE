import type { BlankItem } from "@/types/blank-study"

import { getMaterial } from "./materials"
import { loadMockStore, saveMockStore } from "./mock-store"

const seedBlankItems = (materialId: string): BlankItem[] => [
  {
    id: `${materialId}-b1`,
    materialId,
    sentenceBefore: "프로세스는 실행 중인 ",
    sentenceAfter: " 이다.",
    answer: "프로그램",
    hint: "디스크에 저장된 정적 파일이 아닌, 메모리에서 돌아가는 상태를 떠올려 보세요.",
    status: "pending",
  },
  {
    id: `${materialId}-b2`,
    materialId,
    sentenceBefore: "CPU 스케줄링은 ",
    sentenceAfter: " 에서 다음 프로세스를 선택하는 것이다.",
    answer: "준비 큐",
    hint: "실행 가능 상태의 프로세스들이 대기하는 큐 이름입니다.",
    status: "pending",
  },
  {
    id: `${materialId}-b3`,
    materialId,
    sentenceBefore: "Round Robin은 ",
    sentenceAfter: " 을 넘기면 다음 프로세스로 전환한다.",
    answer: "타임 퀌텀",
    hint: "시간 할당량을 의미하는 용어입니다.",
    status: "pending",
  },
  {
    id: `${materialId}-b4`,
    materialId,
    sentenceBefore: "문맥 교환 시 저장되는 정보를 ",
    sentenceAfter: " 라고 한다.",
    answer: "PCB",
    hint: "Process Control Block의 약자입니다.",
    status: "pending",
  },
  {
    id: `${materialId}-b5`,
    materialId,
    sentenceBefore: "스레드는 ",
    sentenceAfter: " 을 공유한다.",
    answer: "주소 공간",
    hint: "프로세스 단위 자원 중 코드/데이터/힙 영역을 함께 씁니다.",
    status: "pending",
  },
]

export const getBlankItems = (materialId: string): BlankItem[] => {
  const store = loadMockStore()
  return store.blankItems[materialId] ?? []
}

export const generateBlankItems = async (materialId: string): Promise<BlankItem[]> => {
  const material = getMaterial(materialId)
  if (!material) {
    throw new Error("자료를 찾을 수 없습니다.")
  }

  await new Promise((resolve) => setTimeout(resolve, 800))

  const items = seedBlankItems(materialId)
  const store = loadMockStore()
  store.blankItems[materialId] = items
  saveMockStore(store)
  return items
}

export const updateBlankItem = (
  materialId: string,
  itemId: string,
  patch: Partial<Pick<BlankItem, "status">>
): BlankItem[] => {
  const store = loadMockStore()
  const items = store.blankItems[materialId]
  if (!items) return []

  store.blankItems[materialId] = items.map((item) =>
    item.id === itemId ? { ...item, ...patch } : item
  )
  saveMockStore(store)
  return store.blankItems[materialId]
}

export const resetIncorrectBlankItems = (materialId: string): BlankItem[] => {
  const store = loadMockStore()
  const items = store.blankItems[materialId]
  if (!items) return []

  store.blankItems[materialId] = items.map((item) =>
    item.status === "incorrect" ? { ...item, status: "pending" } : item
  )
  saveMockStore(store)
  return store.blankItems[materialId]
}
