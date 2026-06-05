import type { ExplanationEdits, ExplanationFieldEdits } from "@/types/explanation"

import { loadMockStore, saveMockStore } from "./mock-store"

export const getExplanationEdits = (
  materialId: string,
  generatedAt: string
): ExplanationFieldEdits => {
  const store = loadMockStore()
  const stored = store.explanationEdits[materialId]
  if (!stored || stored.generatedAt !== generatedAt) {
    return {}
  }
  return stored.fields
}

export const saveExplanationFieldEdit = (
  materialId: string,
  generatedAt: string,
  fieldKey: string,
  html: string
) => {
  const store = loadMockStore()
  const existing = store.explanationEdits[materialId]
  const fields: ExplanationFieldEdits =
    existing?.generatedAt === generatedAt ? { ...existing.fields } : {}

  fields[fieldKey] = html

  const edits: ExplanationEdits = { generatedAt, fields }
  store.explanationEdits[materialId] = edits
  saveMockStore(store)
}

export const clearExplanationEdits = (materialId: string) => {
  const store = loadMockStore()
  delete store.explanationEdits[materialId]
  saveMockStore(store)
}
