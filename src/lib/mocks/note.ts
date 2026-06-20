import type {
  NoteGenerateOptions,
  LectureNote,
} from "@/types/note"

import { buildMockNote } from "./note-content"
import { getUserFile } from "./user-files"
import { loadMockStore, saveMockStore } from "./mock-store"

const emptyCheatSheet = { formulas: [] as string[], rows: [] }

const normalizeNote = (
  note: Partial<LectureNote> & Pick<LectureNote, "userFileId">
): LectureNote | null => {
  if (!note.title || !note.coreConcepts?.length) {
    return null
  }

  const firstConcept = note.coreConcepts[0]
  if (!("title" in firstConcept && "body" in firstConcept)) {
    return null
  }

  return {
    userFileId: note.userFileId,
    generatedAt: note.generatedAt ?? new Date().toISOString(),
    options: note.options,
    title: note.title,
    estimatedMinutes: note.estimatedMinutes ?? 8,
    accuracyPercent: note.accuracyPercent ?? 85,
    learningGoals: note.learningGoals ?? [],
    coreConcepts: note.coreConcepts as LectureNote["coreConcepts"],
    examples: note.examples ?? [],
    examHighlights: note.examHighlights ?? [],
    confusionPoints: note.confusionPoints ?? [],
    selfCheckQuestions: note.selfCheckQuestions ?? [],
    cheatSheet: note.cheatSheet ?? emptyCheatSheet,
  }
}

export const getNote = (userFileId: string): LectureNote | null => {
  const store = loadMockStore()
  const stored = store.notes[userFileId]
  if (!stored) return null

  return normalizeNote(
    stored as Partial<LectureNote> & Pick<LectureNote, "userFileId">
  )
}

export const generateNote = async (
  userFileId: string,
  options: NoteGenerateOptions
): Promise<LectureNote> => {
  const userFile = getUserFile(userFileId)
  if (!userFile) {
    throw new Error("자료를 찾을 수 없습니다.")
  }
  if (userFile.extractionStatus !== "done") {
    throw new Error("텍스트 추출이 완료된 후 설명을 생성할 수 있습니다.")
  }

  await new Promise((resolve) => setTimeout(resolve, 1200))

  const note: LectureNote = {
    userFileId,
    generatedAt: new Date().toISOString(),
    ...buildMockNote(userFile, options),
  }

  const store = loadMockStore()
  store.notes[userFileId] = note
  delete store.noteEdits[userFileId]
  saveMockStore(store)

  return note
}
