# Blank Study Reference

## Types (`src/types/blank.ts`)

```typescript
BlankSource = "pdf" | "note"
BlankDensity = "light" | "normal" | "dense"  // counts: 5 / 10 / 15
BlankGenerateOptions = { source, range, density }
BlankItem = { id, sentenceBefore, sentenceAfter, answer, hint, status, ... }
BlankSession = { userFileId, generatedAt, options, items, pdfPages? }
```

`range` reuses `NoteRange` from `src/types/note.ts`. Range applies only when `source === "pdf"`.

## Mock API (`src/lib/mocks/blank.ts`)

| Function | Purpose |
|----------|---------|
| `getBlankSession(userFileId)` | Load stored session (or legacy items) |
| `generateBlankSession(userFileId, options)` | Build + persist session; throws if no userFile, extraction incomplete, no note when source=note, or zero items |
| `updateBlankItem(userFileId, itemId, patch)` | Update item status after submit |
| `resetIncorrectBlankItems(userFileId)` | Retry flow |
| `addCustomBlankItem(userFileId, target)` | User-selected text → blank |
| `removeBlankItem(userFileId, itemId)` | Remove blank; returns null if session empty |

Session stored in `mock-store.blankSessions`.

## Source build paths

- **pdf**: `ensureUserFilePdfText` → `buildBlanksFromPdfText` in `src/lib/blank/build-blanks-from-pdf-text.ts`
- **note**: `getNote(userFileId)` → extract from core concepts, exam highlights in `blank-content.ts`

## Note dependency

`useBlank` exposes `hasNote` from `getNote(userFileId)`.

`generateBlankSession` throws:

```txt
강의 노트가 없습니다. 쉽게 설명 탭에서 먼저 생성해 주세요.
```

UI must block generate button and show CTA link — no auto-fallback to PDF.

## UX anti-patterns

- Flashcard / Card-per-item layout
- Numbered list (`1.` `2.`)
- Auto-generate on upload
- Fallback to PDF when note source selected but missing

## Manyfast IDs

- R-YESAGY: 빈칸 암기 도구
- F-GVXHSY, F-TLNABJ: blank study features (Manyfast wording "빈칸 카드" → FE inline workbook)
