import type {
  ListUserFilesOptions,
  UserFile,
  UserFileType,
  UserFileSort,
} from "@/types/user-file"

import { validateUploadFile, getFileTypeFromName } from "@/lib/utils/upload-file"
import { fetchFileBlob, getFileDetail } from "@/lib/api/files"
import { getPdfPageCountFromFile } from "@/lib/utils/pdf-page-count"
import { savePdfBlob } from "@/lib/storage/pdf-blob-store"
import { normalizePdfPages } from "@/lib/pdf/normalize-pdf-pages"
import { extractPdfTextFromBytes } from "@/lib/pdf/extract-pdf-text"
import { getFolderName } from "./folders"
import { loadMockStore, saveMockStore } from "./mock-store"
import { saveUserFilePdfText } from "./pdf-text"
import { getSeedPdfText } from "./pdf-text-seeds"

/** @deprecated Use validateUploadFile */
export const validatePdfFile = validateUploadFile

export { validateUploadFile }

export const searchUserFiles = (query: string): UserFile[] => {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const store = loadMockStore()
  return store.userFiles.filter((m) => m.name.toLowerCase().includes(q))
}

/** UserFile 목록 정렬 (recent/created/folder). 백엔드 목록·mock 목록 공용. */
export const sortUserFiles = (
  items: UserFile[],
  sort: UserFileSort
): UserFile[] => {
  const sorted = [...items]

  if (sort === "recent") {
    sorted.sort((a, b) => {
      const aTime = a.lastStudiedAt ? new Date(a.lastStudiedAt).getTime() : 0
      const bTime = b.lastStudiedAt ? new Date(b.lastStudiedAt).getTime() : 0
      if (aTime !== bTime) return bTime - aTime
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    })
  } else if (sort === "created") {
    sorted.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )
  } else {
    sorted.sort((a, b) => {
      const folderCmp = getFolderName(a.folderId).localeCompare(
        getFolderName(b.folderId),
        "ko"
      )
      if (folderCmp !== 0) return folderCmp
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    })
  }

  return sorted
}

export const listUserFiles = (options: ListUserFilesOptions = {}): UserFile[] => {
  const { folderId = null, searchQuery = "", sort = "recent" } = options
  const store = loadMockStore()
  let items = [...store.userFiles]

  const q = searchQuery.trim().toLowerCase()
  if (q) {
    items = items.filter((m) => m.name.toLowerCase().includes(q))
  } else if (folderId !== null && folderId !== undefined) {
    items = items.filter((m) => m.folderId === folderId)
  }

  return sortUserFiles(items, sort)
}

export const getUserFile = (id: string): UserFile | undefined => {
  const store = loadMockStore()
  return store.userFiles.find((m) => m.id === id)
}

/**
 * 로컬 PDF 처리 + mock-store 미러링. 외부(백엔드)에서 받은 id 로 호출해
 * study/note/blank(미배포 도메인)가 동일 id 로 로컬 데이터를 읽도록 한다.
 * blob 저장(IndexedDB)과 텍스트 추출은 동기적으로 끝낸 뒤 done 상태로 기록한다.
 */
export const processUserFileLocally = async (params: {
  id: string
  name: string
  folderId: string | null
  fileType: UserFileType
  file: File
  pageCount?: number
}): Promise<UserFile> => {
  const { id, name, folderId, fileType, file, pageCount = 1 } = params
  const safePageCount = fileType === "image" ? 1 : pageCount > 0 ? pageCount : 1
  const pdfBytes = await file.arrayBuffer()

  const store = loadMockStore()
  const existing = store.userFiles.find((m) => m.id === id)
  const userFile: UserFile = {
    id,
    name,
    folderId,
    fileType,
    uploadedAt: existing?.uploadedAt ?? new Date().toISOString(),
    extractionStatus: "done",
    pageCount: safePageCount,
    currentPage: existing?.currentPage ?? 1,
    progressPercent: existing?.progressPercent ?? 0,
    lastStudiedAt: existing?.lastStudiedAt ?? null,
  }

  store.userFiles = [userFile, ...store.userFiles.filter((m) => m.id !== id)]
  saveMockStore(store)
  await savePdfBlob(id, pdfBytes)

  if (fileType === "pdf") {
    try {
      const pages = normalizePdfPages(
        await extractPdfTextFromBytes(pdfBytes),
        safePageCount
      )
      if (pages.length) {
        saveUserFilePdfText({
          userFileId: id,
          extractedAt: new Date().toISOString(),
          pages,
        })
      } else {
        const seed = getSeedPdfText(userFile)
        if (seed) saveUserFilePdfText(seed)
      }
    } catch {
      const seed = getSeedPdfText(userFile)
      if (seed) saveUserFilePdfText(seed)
    }
  }

  return userFile
}

/** 동시 하이드레이션 중복 방지(StudyShell·StudyPage 가 같은 id 로 동시에 호출). */
const hydrationInFlight = new Map<string, Promise<UserFile | undefined>>()

/**
 * 로컬 미러에 없는 자료를 백엔드에서 받아 로컬 처리(processUserFileLocally)한다.
 * 다른 기기/브라우저에서 업로드했거나 로컬 store 가 비워진 경우 study 진입을 가능케 한다.
 * 백엔드 단건 조회로 메타데이터를, content 프록시로 원본 바이트를 받아 동일 id 로 미러링한다.
 */
export const hydrateUserFileFromBackend = (
  id: string,
): Promise<UserFile | undefined> => {
  const existing = getUserFile(id)
  if (existing) return Promise.resolve(existing)

  const inFlight = hydrationInFlight.get(id)
  if (inFlight) return inFlight

  const promise = (async (): Promise<UserFile | undefined> => {
    const meta = await getFileDetail(id)
    const blob = await fetchFileBlob(id)
    const file = new File([blob], meta.name, {
      type:
        meta.fileType === "pdf"
          ? "application/pdf"
          : blob.type || "application/octet-stream",
    })
    const pageCount =
      meta.fileType === "pdf"
        ? meta.pageCount > 0
          ? meta.pageCount
          : await getPdfPageCountFromFile(file)
        : 1

    return processUserFileLocally({
      id,
      name: meta.name,
      folderId: meta.folderId,
      fileType: meta.fileType,
      file,
      pageCount,
    })
  })().finally(() => hydrationInFlight.delete(id))

  hydrationInFlight.set(id, promise)
  return promise
}

export const uploadUserFile = async (
  file: File,
  folderId: string | null = null,
  pageCount = 1
): Promise<UserFile> => {
  const error = validateUploadFile(file)
  if (error) {
    throw new Error(error)
  }

  const fileType = getFileTypeFromName(file.name)
  if (!fileType) {
    throw new Error("지원하지 않는 파일 형식입니다.")
  }

  const store = loadMockStore()
  if (folderId) {
    const targetFolder = store.folders.find((f) => f.id === folderId)
    if (!targetFolder) {
      throw new Error("폴더를 찾을 수 없습니다.")
    }
  }

  return processUserFileLocally({
    id: `mat-${Date.now()}`,
    name: file.name,
    folderId,
    fileType,
    file,
    pageCount,
  })
}

export const updateUserFileLastStudied = (id: string): UserFile | undefined => {
  return updateUserFile(id, { lastStudiedAt: new Date().toISOString() })
}

export const moveUserFile = (
  userFileId: string,
  targetFolderId: string
): UserFile => {
  const store = loadMockStore()
  const userFile = store.userFiles.find((item) => item.id === userFileId)
  if (!userFile) {
    throw new Error("자료를 찾을 수 없습니다.")
  }

  const targetFolder = store.folders.find((folder) => folder.id === targetFolderId)
  if (!targetFolder) {
    throw new Error("폴더를 찾을 수 없습니다.")
  }

  if (userFile.folderId === targetFolderId) {
    return userFile
  }

  userFile.folderId = targetFolderId
  saveMockStore(store)
  return userFile
}

export const updateUserFile = (
  id: string,
  patch: Partial<Pick<UserFile, "currentPage" | "progressPercent" | "lastStudiedAt">>
): UserFile | undefined => {
  const store = loadMockStore()
  const index = store.userFiles.findIndex((m) => m.id === id)
  if (index === -1) return undefined

  store.userFiles[index] = { ...store.userFiles[index], ...patch }
  saveMockStore(store)
  return store.userFiles[index]
}

export const deleteUserFile = (id: string): void => {
  const store = loadMockStore()
  store.userFiles = store.userFiles.filter((m) => m.id !== id)
  delete store.notes[id]
  delete store.noteEdits[id]
  delete store.pdfTexts[id]
  delete store.blankSessions[id]
  delete store.blankItems[id]
  saveMockStore(store)
}
