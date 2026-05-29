import type { BlankItem } from "@/types/blank-study"
import type { LectureExplanation } from "@/types/explanation"
import type { Folder, Material } from "@/types/material"
import type { User } from "@/types/auth"

export type MockStoreData = {
  users: User[]
  folders: Folder[]
  materials: Material[]
  explanations: Record<string, LectureExplanation>
  blankItems: Record<string, BlankItem[]>
}

const ROOT_FOLDER_ID = "folder-root"

const seedMaterials: Material[] = [
  {
    id: "mat-1",
    name: "운영체제 중간고사 범위.pdf",
    folderId: ROOT_FOLDER_ID,
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    extractionStatus: "done",
    pageCount: 24,
    currentPage: 1,
    progressPercent: 35,
    lastStudiedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "mat-2",
    name: "자료구조 강의노트.pdf",
    folderId: ROOT_FOLDER_ID,
    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    extractionStatus: "done",
    pageCount: 18,
    currentPage: 1,
    progressPercent: 10,
    lastStudiedAt: null,
  },
]

const defaultStore: MockStoreData = {
  users: [
    {
      id: "user-1",
      email: "student@studyfill.test",
      name: "김민준",
    },
  ],
  folders: [{ id: ROOT_FOLDER_ID, name: "전체 자료" }],
  materials: seedMaterials,
  explanations: {},
  blankItems: {},
}

const STORAGE_KEY = "studyfill-mock-store"

let memoryStore: MockStoreData = structuredClone(defaultStore)

const isBrowser = () => typeof window !== "undefined"

export const loadMockStore = (): MockStoreData => {
  if (!isBrowser()) {
    return structuredClone(memoryStore)
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    memoryStore = structuredClone(defaultStore)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore))
    return structuredClone(memoryStore)
  }

  try {
    memoryStore = { ...defaultStore, ...JSON.parse(raw) } as MockStoreData
    return structuredClone(memoryStore)
  } catch {
    memoryStore = structuredClone(defaultStore)
    return structuredClone(memoryStore)
  }
}

export const saveMockStore = (data: MockStoreData) => {
  memoryStore = structuredClone(data)
  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore))
  }
}

export const getRootFolderId = () => ROOT_FOLDER_ID
