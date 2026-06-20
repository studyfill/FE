import type {
  BlankGenerateOptions,
  BlankItem,
  BlankSession,
} from "@/types/blank"

import { normalizePdfPages } from "@/lib/pdf/normalize-pdf-pages"
import {
  applyCustomBlank,
  applyCustomBlankFromTextNode,
  insertBlankNodeIntoPdfPages,
  isCustomTextBlankTarget,
  type CustomBlankTarget,
} from "@/lib/blank/add-custom-blank"
import {
  mergeBlankText,
  removeBlankFromPdfPages,
  replaceBlankWithTextItem,
} from "@/lib/blank/remove-custom-blank"
import type { UserFilePdfPage } from "@/types/pdf-text"

import { buildMockBlankSession } from "./blank-content"
import { getNote } from "./note"
import { getUserFile } from "./user-files"
import { ensureUserFilePdfText } from "./pdf-text"
import { loadMockStore, saveMockStore } from "./mock-store"

const legacyItemsToSession = (
  userFileId: string,
  items: BlankItem[]
): BlankSession | null => {
  if (!items.length) return null
  return {
    userFileId,
    generatedAt: new Date().toISOString(),
    options: {
      source: "pdf",
      range: "chapter",
      density: "normal",
    },
    items,
  }
}

export const getBlankSession = (userFileId: string): BlankSession | null => {
  const store = loadMockStore()
  const session = store.blankSessions[userFileId]
  if (session) return session

  const legacy = store.blankItems[userFileId]
  if (legacy?.length) {
    return legacyItemsToSession(userFileId, legacy)
  }

  return null
}

export const generateBlankSession = async (
  userFileId: string,
  options: BlankGenerateOptions
): Promise<BlankSession> => {
  const userFile = getUserFile(userFileId)
  if (!userFile) {
    throw new Error("자료를 찾을 수 없습니다.")
  }
  if (userFile.extractionStatus !== "done") {
    throw new Error("텍스트 추출이 완료된 후 빈칸을 생성할 수 있습니다.")
  }

  if (options.source === "note" && !getNote(userFileId)) {
    throw new Error("강의 노트가 없습니다. 쉽게 설명 탭에서 먼저 생성해 주세요.")
  }

  await new Promise((resolve) => setTimeout(resolve, 900))

  const note =
    options.source === "note" ? getNote(userFileId) : null

  let pdfPages: UserFilePdfPage[] | undefined
  if (options.source === "pdf") {
    const pdfText = await ensureUserFilePdfText(userFile)
    pdfPages = normalizePdfPages(pdfText.pages, userFile.pageCount)
  }

  const built = buildMockBlankSession(
    userFile,
    options,
    note,
    pdfPages
  )

  if (built.items.length === 0) {
    throw new Error("빈칸으로 만들 문장을 찾지 못했습니다. 범위나 밀도를 조정해 보세요.")
  }

  const now = new Date().toISOString()
  const session: BlankSession = {
    userFileId,
    generatedAt: now,
    savedAt: now,
    ...built,
  }

  const store = loadMockStore()
  store.blankSessions[userFileId] = session
  delete store.blankItems[userFileId]
  saveMockStore(store)

  return session
}

export const addCustomBlankItem = (
  userFileId: string,
  target: CustomBlankTarget
): BlankSession | null => {
  const store = loadMockStore()
  const session = store.blankSessions[userFileId]
  if (!session) return null

  if (isCustomTextBlankTarget(target)) {
    if (!session.pdfPages) return null

    const textResult = applyCustomBlankFromTextNode(
      session.pdfPages,
      session.items,
      userFileId,
      target
    )
    if (!textResult) return null

    session.pdfPages = textResult.pdfPages
    session.items = textResult.items
  } else {
    const fieldResult = applyCustomBlank(session.items, userFileId, target)
    if (!fieldResult) return null

    session.items = fieldResult.items
    if (session.pdfPages) {
      session.pdfPages = insertBlankNodeIntoPdfPages(
        session.pdfPages,
        target.itemId,
        fieldResult.newBlankItemId,
        fieldResult.field
      )
    }
  }

  store.blankSessions[userFileId] = session
  saveMockStore(store)
  return session
}

export const removeBlankItem = (
  userFileId: string,
  itemId: string
): BlankSession | null => {
  const store = loadMockStore()
  const session = store.blankSessions[userFileId]
  if (!session) return null

  const item = session.items.find((entry) => entry.id === itemId)
  if (!item || item.isTextOnly) return session

  const mergedText = mergeBlankText(item)
  const remainingBlanks = session.items.filter(
    (entry) => !entry.isTextOnly && entry.id !== itemId
  )

  if (remainingBlanks.length === 0) {
    delete store.blankSessions[userFileId]
    saveMockStore(store)
    return null
  }

  if (session.pdfPages) {
    session.pdfPages = removeBlankFromPdfPages(
      session.pdfPages,
      itemId,
      mergedText
    )
    session.items = session.items.filter((entry) => entry.id !== itemId)
  } else {
    session.items = replaceBlankWithTextItem(
      session.items,
      itemId,
      mergedText,
      userFileId
    )
  }

  store.blankSessions[userFileId] = session
  saveMockStore(store)
  return session
}

export const updateBlankItem = (
  userFileId: string,
  itemId: string,
  patch: Partial<Pick<BlankItem, "status">>
): BlankSession | null => {
  const store = loadMockStore()
  const session = store.blankSessions[userFileId]
  if (!session) return null

  session.items = session.items.map((item) =>
    item.id === itemId ? { ...item, ...patch } : item
  )
  store.blankSessions[userFileId] = session
  saveMockStore(store)
  return session
}

export const resetIncorrectBlankItems = (
  userFileId: string
): BlankSession | null => {
  const store = loadMockStore()
  const session = store.blankSessions[userFileId]
  if (!session) return null

  session.items = session.items.map((item) =>
    item.status === "incorrect" ? { ...item, status: "pending" } : item
  )
  store.blankSessions[userFileId] = session
  saveMockStore(store)
  return session
}

export const saveBlankSession = (
  userFileId: string
): BlankSession | null => {
  const store = loadMockStore()
  const session = store.blankSessions[userFileId]
  if (!session) return null

  session.savedAt = new Date().toISOString()
  store.blankSessions[userFileId] = session
  saveMockStore(store)
  return session
}

/** @deprecated use getBlankSession */
export const getBlankItems = (userFileId: string): BlankItem[] =>
  getBlankSession(userFileId)?.items ?? []

/** @deprecated use generateBlankSession */
export const generateBlankItems = async (
  userFileId: string
): Promise<BlankItem[]> => {
  const session = await generateBlankSession(userFileId, {
    source: "pdf",
    range: "chapter",
    density: "normal",
  })
  return session.items
}
