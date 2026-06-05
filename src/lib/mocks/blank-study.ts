import type {
  BlankGenerateOptions,
  BlankItem,
  BlankStudySession,
} from "@/types/blank-study"

import { buildBlanksFromPdfText } from "@/lib/blank-study/build-blanks-from-pdf-text"
import { applyCustomBlank, type CustomBlankTarget } from "@/lib/blank-study/add-custom-blank"
import type { MaterialPdfPage } from "@/types/pdf-text"

import { buildMockBlankSession } from "./blank-study-content"
import { getExplanation } from "./explanation"
import { getMaterial } from "./materials"
import { ensureMaterialPdfText } from "./pdf-text"
import { loadMockStore, saveMockStore } from "./mock-store"

const legacyItemsToSession = (
  materialId: string,
  items: BlankItem[]
): BlankStudySession | null => {
  if (!items.length) return null
  return {
    materialId,
    generatedAt: new Date().toISOString(),
    options: {
      source: "pdf",
      range: "chapter",
      density: "normal",
    },
    items,
  }
}

export const getBlankSession = (materialId: string): BlankStudySession | null => {
  const store = loadMockStore()
  const session = store.blankSessions[materialId]
  if (session) return session

  const legacy = store.blankItems[materialId]
  if (legacy?.length) {
    return legacyItemsToSession(materialId, legacy)
  }

  return null
}

export const generateBlankSession = async (
  materialId: string,
  options: BlankGenerateOptions
): Promise<BlankStudySession> => {
  const material = getMaterial(materialId)
  if (!material) {
    throw new Error("자료를 찾을 수 없습니다.")
  }
  if (material.extractionStatus !== "done") {
    throw new Error("텍스트 추출이 완료된 후 빈칸을 생성할 수 있습니다.")
  }

  if (options.source === "explanation" && !getExplanation(materialId)) {
    throw new Error("강의 노트가 없습니다. 쉽게 설명 탭에서 먼저 생성해 주세요.")
  }

  await new Promise((resolve) => setTimeout(resolve, 900))

  const explanation =
    options.source === "explanation" ? getExplanation(materialId) : null

  let pdfPages: MaterialPdfPage[] | undefined
  if (options.source === "pdf") {
    const pdfText = await ensureMaterialPdfText(material)
    pdfPages = pdfText.pages
  }

  const built = buildMockBlankSession(
    material,
    options,
    explanation,
    pdfPages
  )

  if (built.items.length === 0) {
    throw new Error("빈칸으로 만들 문장을 찾지 못했습니다. 범위나 밀도를 조정해 보세요.")
  }

  const session: BlankStudySession = {
    materialId,
    generatedAt: new Date().toISOString(),
    ...built,
  }

  const store = loadMockStore()
  store.blankSessions[materialId] = session
  delete store.blankItems[materialId]
  saveMockStore(store)

  return session
}

export const addCustomBlankItem = (
  materialId: string,
  target: CustomBlankTarget
): BlankStudySession | null => {
  const store = loadMockStore()
  const session = store.blankSessions[materialId]
  if (!session) return null

  session.items = applyCustomBlank(session.items, materialId, target)
  store.blankSessions[materialId] = session
  saveMockStore(store)
  return session
}

export const updateBlankItem = (
  materialId: string,
  itemId: string,
  patch: Partial<Pick<BlankItem, "status">>
): BlankStudySession | null => {
  const store = loadMockStore()
  const session = store.blankSessions[materialId]
  if (!session) return null

  session.items = session.items.map((item) =>
    item.id === itemId ? { ...item, ...patch } : item
  )
  store.blankSessions[materialId] = session
  saveMockStore(store)
  return session
}

export const resetIncorrectBlankItems = (
  materialId: string
): BlankStudySession | null => {
  const store = loadMockStore()
  const session = store.blankSessions[materialId]
  if (!session) return null

  session.items = session.items.map((item) =>
    item.status === "incorrect" ? { ...item, status: "pending" } : item
  )
  store.blankSessions[materialId] = session
  saveMockStore(store)
  return session
}

/** @deprecated use getBlankSession */
export const getBlankItems = (materialId: string): BlankItem[] =>
  getBlankSession(materialId)?.items ?? []

/** @deprecated use generateBlankSession */
export const generateBlankItems = async (
  materialId: string
): Promise<BlankItem[]> => {
  const session = await generateBlankSession(materialId, {
    source: "pdf",
    range: "chapter",
    density: "normal",
  })
  return session.items
}
