import type { NoteEdits, NoteFieldEdits } from "@/types/note"

import { loadMockStore, saveMockStore } from "./mock-store"

export const getNoteEdits = (
  userFileId: string,
  generatedAt: string
): NoteFieldEdits => {
  const store = loadMockStore()
  const stored = store.noteEdits[userFileId]
  if (!stored || stored.generatedAt !== generatedAt) {
    return {}
  }
  return stored.fields
}

export const saveNoteFieldEdit = (
  userFileId: string,
  generatedAt: string,
  fieldKey: string,
  html: string
) => {
  const store = loadMockStore()
  const existing = store.noteEdits[userFileId]
  const fields: NoteFieldEdits =
    existing?.generatedAt === generatedAt ? { ...existing.fields } : {}

  fields[fieldKey] = html

  const edits: NoteEdits = { generatedAt, fields }
  store.noteEdits[userFileId] = edits
  saveMockStore(store)
}

export const clearNoteEdits = (userFileId: string) => {
  const store = loadMockStore()
  delete store.noteEdits[userFileId]
  saveMockStore(store)
}
