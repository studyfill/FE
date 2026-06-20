import type {
  ListMaterialsOptions,
  Material,
  MaterialFileType,
  MaterialSort,
} from "@/types/material"

import { validateUploadFile, getFileTypeFromName } from "@/lib/utils/upload-file"
import { savePdfBlob } from "@/lib/storage/pdf-blob-store"
import { normalizePdfPages } from "@/lib/pdf/normalize-pdf-pages"
import { extractPdfTextFromBytes } from "@/lib/pdf/extract-pdf-text"
import { getFolderName } from "./folders"
import { loadMockStore, saveMockStore } from "./mock-store"
import { saveMaterialPdfText } from "./pdf-text"
import { getSeedPdfText } from "./pdf-text-seeds"

/** @deprecated Use validateUploadFile */
export const validatePdfFile = validateUploadFile

export { validateUploadFile }

export const searchMaterials = (query: string): Material[] => {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const store = loadMockStore()
  return store.materials.filter((m) => m.name.toLowerCase().includes(q))
}

/** Material 목록 정렬 (recent/created/folder). 백엔드 목록·mock 목록 공용. */
export const sortMaterials = (
  items: Material[],
  sort: MaterialSort
): Material[] => {
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

export const listMaterials = (options: ListMaterialsOptions = {}): Material[] => {
  const { folderId = null, searchQuery = "", sort = "recent" } = options
  const store = loadMockStore()
  let items = [...store.materials]

  const q = searchQuery.trim().toLowerCase()
  if (q) {
    items = items.filter((m) => m.name.toLowerCase().includes(q))
  } else if (folderId !== null && folderId !== undefined) {
    items = items.filter((m) => m.folderId === folderId)
  }

  return sortMaterials(items, sort)
}

export const getMaterial = (id: string): Material | undefined => {
  const store = loadMockStore()
  return store.materials.find((m) => m.id === id)
}

/**
 * 로컬 PDF 처리 + mock-store 미러링. 외부(백엔드)에서 받은 id 로 호출해
 * study/explanation/blank-study(미배포 도메인)가 동일 id 로 로컬 데이터를 읽도록 한다.
 * blob 저장(IndexedDB)과 텍스트 추출은 동기적으로 끝낸 뒤 done 상태로 기록한다.
 */
export const processMaterialLocally = async (params: {
  id: string
  name: string
  folderId: string | null
  fileType: MaterialFileType
  file: File
  pageCount?: number
}): Promise<Material> => {
  const { id, name, folderId, fileType, file, pageCount = 1 } = params
  const safePageCount = fileType === "image" ? 1 : pageCount > 0 ? pageCount : 1
  const pdfBytes = await file.arrayBuffer()

  const store = loadMockStore()
  const existing = store.materials.find((m) => m.id === id)
  const material: Material = {
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

  store.materials = [material, ...store.materials.filter((m) => m.id !== id)]
  saveMockStore(store)
  await savePdfBlob(id, pdfBytes)

  if (fileType === "pdf") {
    try {
      const pages = normalizePdfPages(
        await extractPdfTextFromBytes(pdfBytes),
        safePageCount
      )
      if (pages.length) {
        saveMaterialPdfText({
          materialId: id,
          extractedAt: new Date().toISOString(),
          pages,
        })
      } else {
        const seed = getSeedPdfText(material)
        if (seed) saveMaterialPdfText(seed)
      }
    } catch {
      const seed = getSeedPdfText(material)
      if (seed) saveMaterialPdfText(seed)
    }
  }

  return material
}

export const uploadMaterial = async (
  file: File,
  folderId: string | null = null,
  pageCount = 1
): Promise<Material> => {
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

  return processMaterialLocally({
    id: `mat-${Date.now()}`,
    name: file.name,
    folderId,
    fileType,
    file,
    pageCount,
  })
}

export const updateMaterialLastStudied = (id: string): Material | undefined => {
  return updateMaterial(id, { lastStudiedAt: new Date().toISOString() })
}

export const moveMaterial = (
  materialId: string,
  targetFolderId: string
): Material => {
  const store = loadMockStore()
  const material = store.materials.find((item) => item.id === materialId)
  if (!material) {
    throw new Error("자료를 찾을 수 없습니다.")
  }

  const targetFolder = store.folders.find((folder) => folder.id === targetFolderId)
  if (!targetFolder) {
    throw new Error("폴더를 찾을 수 없습니다.")
  }

  if (material.folderId === targetFolderId) {
    return material
  }

  material.folderId = targetFolderId
  saveMockStore(store)
  return material
}

export const updateMaterial = (
  id: string,
  patch: Partial<Pick<Material, "currentPage" | "progressPercent" | "lastStudiedAt">>
): Material | undefined => {
  const store = loadMockStore()
  const index = store.materials.findIndex((m) => m.id === id)
  if (index === -1) return undefined

  store.materials[index] = { ...store.materials[index], ...patch }
  saveMockStore(store)
  return store.materials[index]
}

export const deleteMaterial = (id: string): void => {
  const store = loadMockStore()
  store.materials = store.materials.filter((m) => m.id !== id)
  delete store.explanations[id]
  delete store.explanationEdits[id]
  delete store.pdfTexts[id]
  delete store.blankSessions[id]
  delete store.blankItems[id]
  saveMockStore(store)
}
