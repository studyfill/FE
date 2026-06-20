# Blank Study Reference

## Types (`src/types/blank-study.ts`)

```typescript
BlankSource = "pdf" | "explanation"
BlankDensity = "light" | "normal" | "dense"  // counts: 5 / 10 / 15
BlankGenerateOptions = { source, range, density }
BlankItem = { id, sentenceBefore, sentenceAfter, answer, hint, status, ... }
BlankStudySession = { materialId, generatedAt, options, items, pdfPages? }
```

`range` reuses `ExplanationRange` from `src/types/explanation.ts`. Range applies only when `source === "pdf"`.

## Mock API (`src/lib/mocks/blank-study.ts`)

| Function | Purpose |
|----------|---------|
| `getBlankSession(materialId)` | Load stored session (or legacy items) |
| `generateBlankSession(materialId, options)` | Build + persist session; throws if no material, extraction incomplete, no explanation when source=explanation, or zero items |
| `updateBlankItem(materialId, itemId, patch)` | Update item status after submit |
| `resetIncorrectBlankItems(materialId)` | Retry flow |
| `addCustomBlankItem(materialId, target)` | User-selected text → blank |
| `removeBlankItem(materialId, itemId)` | Remove blank; returns null if session empty |

Session stored in `mock-store.blankSessions`.

## Source build paths

- **pdf**: `ensureMaterialPdfText` → `buildBlanksFromPdfText` in `src/lib/blank-study/build-blanks-from-pdf-text.ts`
- **explanation**: `getExplanation(materialId)` → extract from core concepts, exam highlights in `blank-study-content.ts`

## Explanation dependency

`useBlankStudy` exposes `hasExplanation` from `getExplanation(materialId)`.

`generateBlankSession` throws:

```txt
강의 노트가 없습니다. 쉽게 설명 탭에서 먼저 생성해 주세요.
```

UI must block generate button and show CTA link — no auto-fallback to PDF.

## UX anti-patterns

- Flashcard / Card-per-item layout
- Numbered list (`1.` `2.`)
- Auto-generate on upload
- Fallback to PDF when explanation source selected but missing

## Manyfast IDs

- R-YESAGY: 빈칸 암기 도구
- F-GVXHSY, F-TLNABJ: blank study features (Manyfast wording "빈칸 카드" → FE inline workbook)
