---
name: blank-study
description: Implements StudyFill blank-study inline active recall. Use when adding blank generation, result UI, answer checking, custom blanks, or working in src/features/blank.
---

# Blank Study

## Before coding

1. Read `src/features/blank/CLAUDE.md` and `src/features/study/CLAUDE.md`
2. For types, mocks, and edge cases see [reference.md](reference.md)
3. (Optional) Manyfast context if available: `read_project_meta` for F-GVXHSY, F-TLNABJ (R-YESAGY)

## Implementation checklist

- [ ] `BlankGeneratePanel` — source/range/density options; range hidden when source=`note`
- [ ] Source=`note` guard in hook + mock; block generate + CTA to note tab when no lecture note
- [ ] `BlankResultView` — progress bar, inline prose (no Card list, no numbered list)
- [ ] `BlankProseSection` / `BlankPdfProseView` — continuous `<p>` flow with inline inputs
- [ ] Answer submit, hint/feedback, retry incorrect via `useBlank`
- [ ] Mock API: `generateBlankSession`, `getBlankSession` in `src/lib/mocks/blank.ts`
- [ ] UserFile progress sync on submit/retry/remove

## Key files

| Area | Path |
|------|------|
| Hook | `src/features/blank/hooks/useBlank.ts` |
| Generate UI | `src/features/blank/components/BlankGeneratePanel.tsx` |
| Result UI | `src/features/blank/components/BlankResultView.tsx` |
| Prose | `src/features/blank/components/BlankProseSection.tsx` |
| Types | `src/types/blank.ts` |
| Mocks | `src/lib/mocks/blank.ts`, `blank-content.ts` |
| Build logic | `src/lib/blank/build-blanks-from-pdf-text.ts` |
| Route | `src/app/(app)/study/[id]/blank/page.tsx` |

## Test plan

- [ ] Generate from PDF source with each range/density
- [ ] Generate from note source after lecture note exists
- [ ] Block generate when source=note and no note; CTA navigates to note tab
- [ ] Blanks render as inline prose, not numbered list or flashcard cards
- [ ] Correct/incorrect feedback and retry incorrect resets pending items
- [ ] Custom blank add/remove (PDF prose mode) updates session
