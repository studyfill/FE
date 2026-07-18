import type { BlankItem, BlankSession } from "@/types/blank"
import type { NoteEdits, LectureNote } from "@/types/note"
import type { UserFilePdfText } from "@/types/pdf-text"
import type { Folder, UserFile } from "@/types/user-file"
import type { User } from "@/types/auth"

import {
  DEFAULT_FOLDER_COLOR,
  type FolderColorId,
} from "@/constants/folder-colors"

import { getFileTypeFromName } from "@/lib/utils/upload-file"

import { FOLDER_IDS } from "./folder-ids"

export type MockStoreData = {
  users: User[]
  folders: Folder[]
  userFiles: UserFile[]
  notes: Record<string, LectureNote>
  noteEdits: Record<string, NoteEdits>
  pdfTexts: Record<string, UserFilePdfText>
  blankSessions: Record<string, BlankSession>
  /** @deprecated migrated to blankSessions */
  blankItems: Record<string, BlankItem[]>
}

const now = Date.now()

const seedFolders: Folder[] = [
  { id: FOLDER_IDS.major, name: "전공", parentId: null, color: "blue" },
  { id: FOLDER_IDS.ds, name: "자료구조", parentId: FOLDER_IDS.major, color: "green" },
  { id: FOLDER_IDS.os, name: "운영체제", parentId: FOLDER_IDS.major, color: "indigo" },
  { id: FOLDER_IDS.liberal, name: "교양", parentId: null, color: "yellow" },
  { id: FOLDER_IDS.exam, name: "시험대비", parentId: null, color: "red", favorite: true },
]

const seedUserFiles: UserFile[] = [
  {
    id: "mat-1",
    name: "자료구조 5주차 — 트리와 이진탐색트리.pdf",
    folderId: FOLDER_IDS.ds,
    fileType: "pdf",
    uploadedAt: new Date(now - 7200000).toISOString(),
    extractionStatus: "done",
    pageCount: 48,
    currentPage: 1,
    progressPercent: 35,
    lastStudiedAt: new Date(now - 3600000).toISOString(),
  },
  {
    id: "mat-2",
    name: "해시 테이블과 충돌 해결 기법.pdf",
    folderId: FOLDER_IDS.ds,
    fileType: "pdf",
    uploadedAt: new Date(now - 600000).toISOString(),
    extractionStatus: "done",
    pageCount: 32,
    currentPage: 1,
    progressPercent: 0,
    lastStudiedAt: null,
  },
  {
    id: "mat-3",
    name: "운영체제 중간고사 범위.pdf",
    folderId: FOLDER_IDS.os,
    fileType: "pdf",
    uploadedAt: new Date(now - 86400000 * 2).toISOString(),
    extractionStatus: "done",
    pageCount: 24,
    currentPage: 1,
    progressPercent: 35,
    lastStudiedAt: new Date(now - 86400000).toISOString(),
  },
  {
    id: "mat-4",
    name: "유기화학 — 작용기와 명명법.pdf",
    folderId: FOLDER_IDS.exam,
    fileType: "pdf",
    uploadedAt: new Date(now - 86400000 * 5).toISOString(),
    extractionStatus: "done",
    pageCount: 67,
    currentPage: 1,
    progressPercent: 20,
    lastStudiedAt: null,
  },
  {
    id: "mat-5",
    name: "헌법 — 기본권의 효력과 제한.pdf",
    folderId: FOLDER_IDS.exam,
    fileType: "pdf",
    uploadedAt: new Date(now - 86400000).toISOString(),
    extractionStatus: "done",
    pageCount: 38,
    currentPage: 1,
    progressPercent: 15,
    lastStudiedAt: new Date(now - 43200000).toISOString(),
  },
  {
    id: "mat-6",
    name: "현대사회와 문화.pdf",
    folderId: FOLDER_IDS.liberal,
    fileType: "pdf",
    uploadedAt: new Date(now - 86400000 * 3).toISOString(),
    extractionStatus: "done",
    pageCount: 42,
    currentPage: 1,
    progressPercent: 5,
    lastStudiedAt: null,
  },
  {
    id: "mat-7",
    name: "자료구조 개념 정리.pdf",
    folderId: FOLDER_IDS.ds,
    fileType: "pdf",
    uploadedAt: new Date(now - 86400000 * 4).toISOString(),
    extractionStatus: "done",
    pageCount: 18,
    currentPage: 1,
    progressPercent: 60,
    lastStudiedAt: new Date(now - 172800000).toISOString(),
  },
  {
    id: "mat-8",
    name: "프로세스와 스레드.pdf",
    folderId: FOLDER_IDS.os,
    fileType: "pdf",
    uploadedAt: new Date(now - 86400000 * 6).toISOString(),
    extractionStatus: "done",
    pageCount: 30,
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
  folders: seedFolders,
  userFiles: seedUserFiles,
  notes: {},
  noteEdits: {},
  pdfTexts: {},
  blankSessions: {},
  blankItems: {},
}

const STORAGE_KEY = "studyfill-mock-store-v2"

let memoryStore: MockStoreData = structuredClone(defaultStore)

const isBrowser = () => typeof window !== "undefined"

const LEGACY_FOLDER_COLORS: Record<string, FolderColorId> = {
  [FOLDER_IDS.major]: "blue",
  [FOLDER_IDS.ds]: "green",
  [FOLDER_IDS.os]: "indigo",
  [FOLDER_IDS.liberal]: "yellow",
  [FOLDER_IDS.exam]: "red",
}

const normalizeUserFiles = (userFiles: UserFile[]): UserFile[] =>
  userFiles.map((userFile) => ({
    ...userFile,
    fileType:
      userFile.fileType ?? getFileTypeFromName(userFile.name) ?? "pdf",
  }))

const normalizeFolders = (folders: Folder[]): Folder[] =>
  folders.map((folder) => ({
    ...folder,
    parentId: folder.parentId ?? null,
    color:
      folder.color ??
      LEGACY_FOLDER_COLORS[folder.id] ??
      DEFAULT_FOLDER_COLOR,
    // 레거시 스토어의 pinned → favorite 이관
    favorite:
      folder.favorite ??
      (folder as Folder & { pinned?: boolean }).pinned ??
      false,
  }))

const isLegacyStore = (data: MockStoreData) =>
  data.folders.some((f) => !("parentId" in f) || f.parentId === undefined)

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
    const parsed = JSON.parse(raw) as MockStoreData
    if (isLegacyStore(parsed)) {
      memoryStore = structuredClone(defaultStore)
    } else {
      memoryStore = {
        ...defaultStore,
        ...parsed,
        folders: normalizeFolders(
          parsed.folders?.length ? parsed.folders : defaultStore.folders
        ),
        userFiles: normalizeUserFiles(
          parsed.userFiles?.length ? parsed.userFiles : defaultStore.userFiles
        ),
        noteEdits: parsed.noteEdits ?? {},
        pdfTexts: parsed.pdfTexts ?? {},
        blankSessions: parsed.blankSessions ?? {},
        blankItems: parsed.blankItems ?? {},
      }
    }
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
