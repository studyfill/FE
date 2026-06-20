---
name: blank-study
description: Implements StudyFill blank-study inline active recall. Use when adding blank generation, result UI, answer checking, custom blanks, or working in src/features/blank-study.
---

# Blank Study

## Before coding

1. Read `src/features/blank-study/CLAUDE.md` and `src/features/study/CLAUDE.md`
2. For types, mocks, and edge cases see [reference.md](reference.md)
3. (Optional) Manyfast context if available: `read_project_meta` for F-GVXHSY, F-TLNABJ (R-YESAGY)

## Implementation checklist

- [ ] `BlankGeneratePanel` — source/range/density options; range hidden when source=`explanation`
- [ ] Source=`explanation` guard in hook + mock; block generate + CTA to explanation tab when no lecture note
- [ ] `BlankStudyResultView` — progress bar, inline prose (no Card list, no numbered list)
- [ ] `BlankProseSection` / `BlankPdfProseView` — continuous `<p>` flow with inline inputs
- [ ] Answer submit, hint/feedback, retry incorrect via `useBlankStudy`
- [ ] Mock API: `generateBlankSession`, `getBlankSession` in `src/lib/mocks/blank-study.ts`
- [ ] Material progress sync on submit/retry/remove

## Key files

| Area | Path |
|------|------|
| Hook | `src/features/blank-study/hooks/useBlankStudy.ts` |
| Generate UI | `src/features/blank-study/components/BlankGeneratePanel.tsx` |
| Result UI | `src/features/blank-study/components/BlankStudyResultView.tsx` |
| Prose | `src/features/blank-study/components/BlankProseSection.tsx` |
| Types | `src/types/blank-study.ts` |
| Mocks | `src/lib/mocks/blank-study.ts`, `blank-study-content.ts` |
| Build logic | `src/lib/blank-study/build-blanks-from-pdf-text.ts` |
| Route | `src/app/(app)/study/[id]/blank-study/page.tsx` |

## Test plan

- [ ] Generate from PDF source with each range/density
- [ ] Generate from explanation source after lecture note exists
- [ ] Block generate when source=explanation and no explanation; CTA navigates to explanation tab
- [ ] Blanks render as inline prose, not numbered list or flashcard cards
- [ ] Correct/incorrect feedback and retry incorrect resets pending items
- [ ] Custom blank add/remove (PDF prose mode) updates session
