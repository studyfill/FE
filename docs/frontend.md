# StudyFill Frontend — Stack & Standards (상세)

> 루트 `CLAUDE.md`의 스택·구조·UI·코드 스타일 상세판. 충돌 시 `CLAUDE.md`를 우선한다.
> git 규칙은 [docs/git.md](git.md), 제품/Phase 맥락은 [docs/product.md](product.md).

## Core Stack

- Next.js App Router
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- Radix UI
- lucide-react

## Architecture

Use scalable, feature-based structure:

```txt
src/~
  app/
  components/
    common/
    layout/
    ui/
  features/
    landing/        # 랜딩 페이지 (Phase A)
    auth/
    dashboard/      # 내 라이브러리: 폴더, 검색, 업로드, PDF 그리드
    pdf/
    explanation/
    quiz/
    blank-study/
    review/
    tutor/
  lib/
    api/
    mocks/
    utils/
  hooks/
  types/
  constants/
```

- Separate UI and business logic
- Keep components small and reusable; avoid large page components
- Extract repeated logic into hooks/utils
- Use mock APIs before backend integration

## UI / UX Direction

StudyFill is an AI-powered PDF study platform — not a generic AI chat or flashcard product.

Core flow (Phase A): Upload → AI lecture explanation → fill-in-the-blank memorization. Repeated review / quiz / tutor are Phase B.

UI should feel: white background, compact, beginner-friendly, modern productivity SaaS, calm and focused.

Inspired by: Notion, Linear, Perplexity

Avoid: dark mode style, colorful educational UI, cluttered dashboards, enterprise admin feel

## Code Style

- TypeScript only; no semicolons
- Use `const` arrow functions with descriptive names
- Event handlers start with `handle` (e.g. `const handleSubmit = () => {}`)
- Use early returns; prioritize readability over cleverness

## Styling

- TailwindCSS only; avoid separate CSS files unless necessary
- Use shadcn/ui components
- Subtle borders, soft shadows, compact spacing, minimal green primary accent (library brand)

### UI density baseline

- Root scale: `html { font-size: 80%; }` in [`globals.css`](../src/app/globals.css) — design at 100% browser zoom matches prior 80% zoom look
- Do **not** add new `text-[Npx]`, `size-[Npx]`, or layout px literals in feature code
- Use `@theme` tokens instead:
  - Typography: `text-body` (15px design), `text-body-sm` (14px), `text-caption` (13px), `text-micro` (11px), `text-title-xl` (28px)
  - Layout: `w-sidebar`, `w-folder-strip`, `max-w-generate-panel`, `max-w-dialog-sm`, `max-w-dialog-md`, `h-material-thumb`
  - Icons: `size-icon-md` (18px design), `size-icon-xl` (52px design)
  - Radius: `rounded-button` (10px design)
- shadcn `text-sm` / `text-xs` inherit root scale automatically; no separate adjustment needed

## Language

- Korean UI only for MVP; do not add i18n unless explicitly requested

## Responsive (Phase A)

- Study workspace: `lg` (1024px) breakpoint
- `>= lg` or landscape tablet: split-pane (PDF left, panel right)
- `< lg` portrait: tab switch between PDF and feature panel (`StudyMobilePaneTabs`)

## Accessibility

- Add `aria-label` for icon buttons
- Prefer `<button>` over div click handlers
- Keep forms accessible; use keyboard-friendly interactions

## Feature-specific guidance

Feature-specific UX and components: see each `src/features/<feature>/CLAUDE.md` or `.claude/skills/*/SKILL.md`.

## Development Workflow

Before coding:
1. Briefly explain implementation plan
2. Briefly explain folder/component structure
3. Then implement

Never leave TODOs, placeholders, or incomplete code. Always ship production-quality, reusable, maintainable code.

For branch naming, commits, and PRs, follow [docs/git.md](git.md).
