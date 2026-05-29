import type { Material } from "@/types/material"

import { getRootFolderId, loadMockStore, saveMockStore } from "./mock-store"

const MAX_FILE_SIZE_MB = 20
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

export const listMaterials = (folderId?: string): Material[] => {
  const store = loadMockStore()
  if (!folderId || folderId === getRootFolderId()) {
    return [...store.materials].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )
  }
  return store.materials
    .filter((m) => m.folderId === folderId)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
}

export const getMaterial = (id: string): Material | undefined => {
  const store = loadMockStore()
  return store.materials.find((m) => m.id === id)
}

export const uploadMaterial = async (file: File): Promise<Material> => {
  const error = validatePdfFile(file)
  if (error) {
    throw new Error(error)
  }

  const store = loadMockStore()
  const material: Material = {
    id: `mat-${Date.now()}`,
    name: file.name,
    folderId: getRootFolderId(),
    uploadedAt: new Date().toISOString(),
    extractionStatus: "processing",
    pageCount: 0,
    currentPage: 1,
    progressPercent: 0,
    lastStudiedAt: null,
  }

  store.materials.unshift(material)
  saveMockStore(store)

  await new Promise((resolve) => setTimeout(resolve, 1500))

  const updated = loadMockStore()
  const target = updated.materials.find((m) => m.id === material.id)
  if (target) {
    target.extractionStatus = "done"
    target.pageCount = 12 + Math.floor(Math.random() * 20)
    saveMockStore(updated)
  }

  return getMaterial(material.id) ?? material
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
  delete store.blankItems[id]
  saveMockStore(store)
}
