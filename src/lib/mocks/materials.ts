import type { ListMaterialsOptions, Material } from "@/types/material"

import { PDF_UPLOAD_MAX_SIZE_MB } from "@/constants/upload"
import { savePdfBlob } from "@/lib/storage/pdf-blob-store"
import { extractPdfTextFromBytes } from "@/lib/pdf/extract-pdf-text"
import { DEFAULT_UPLOAD_FOLDER_ID } from "./folder-ids"
import { getFolderName, getFolderScopeIds } from "./folders"
import { loadMockStore, saveMockStore } from "./mock-store"
import { saveMaterialPdfText } from "./pdf-text"
import { getSeedPdfText } from "./pdf-text-seeds"

const MAX_FILE_SIZE_MB = PDF_UPLOAD_MAX_SIZE_MB
const ALLOWED_EXTENSION = ".pdf"

export const validatePdfFile = (file: File): string | null => {
  if (!file.name.toLowerCase().endsWith(ALLOWED_EXTENSION)) {
    return "PDF 파일만 업로드할 수 있습니다."
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `파일 크기는 ${MAX_FILE_SIZE_MB}MB 이하여야 합니다.`
  }
  return null
}

export const searchMaterials = (query: string): Material[] => {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const store = loadMockStore()
  return store.materials.filter((m) => m.name.toLowerCase().includes(q))
}

export const listMaterials = (options: ListMaterialsOptions = {}): Material[] => {
  const { folderId = null, searchQuery = "", sort = "date" } = options
  const store = loadMockStore()
  let items = [...store.materials]

  const q = searchQuery.trim().toLowerCase()
  if (q) {
    items = items.filter((m) => m.name.toLowerCase().includes(q))
  } else {
    const scope = getFolderScopeIds(folderId, store.folders)
    if (scope) {
      items = items.filter(
        (m) => m.folderId !== null && scope.includes(m.folderId)
      )
    }
  }

  if (sort === "date") {
    items.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )
  } else {
    items.sort((a, b) => {
      const folderCmp = getFolderName(a.folderId).localeCompare(
        getFolderName(b.folderId),
        "ko"
      )
      if (folderCmp !== 0) return folderCmp
      return (
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )
    })
  }

  return items
}

export const getMaterial = (id: string): Material | undefined => {
  const store = loadMockStore()
  return store.materials.find((m) => m.id === id)
}

export const uploadMaterial = async (
  file: File,
  folderId: string | null = null,
  pageCount = 1
): Promise<Material> => {
  const error = validatePdfFile(file)
  if (error) {
    throw new Error(error)
  }

  const store = loadMockStore()
  if (folderId) {
    const targetFolder = store.folders.find((f) => f.id === folderId)
    if (!targetFolder) {
      throw new Error("폴더를 찾을 수 없습니다.")
    }
  }

  const safePageCount = pageCount > 0 ? pageCount : 1
  const pdfBytes = await file.arrayBuffer()

  const material: Material = {
    id: `mat-${Date.now()}`,
    name: file.name,
    folderId,
    uploadedAt: new Date().toISOString(),
    extractionStatus: "processing",
    pageCount: 0,
    currentPage: 1,
    progressPercent: 0,
    lastStudiedAt: null,
  }

  store.materials.unshift(material)
  saveMockStore(store)
  await savePdfBlob(material.id, pdfBytes)

  await new Promise((resolve) => setTimeout(resolve, 1500))

  try {
    const pages = await extractPdfTextFromBytes(pdfBytes)
    if (pages.length) {
      saveMaterialPdfText({
        materialId: material.id,
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

  const updated = loadMockStore()
  const target = updated.materials.find((m) => m.id === material.id)
  if (target) {
    target.extractionStatus = "done"
    target.pageCount = safePageCount
    saveMockStore(updated)
  }

  return getMaterial(material.id) ?? material
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
