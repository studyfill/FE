# StudyFill FE

AI-powered PDF study platform frontend.

## Stack

- Next.js (App Router)
- React + TypeScript
- TailwindCSS
- shadcn/ui
- lucide-react

## Getting Started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## Project Structure

```txt
src/
  app/              # Next.js App Router pages
  components/
    common/         # Shared non-ui components
    layout/         # AppShell, layout components
    ui/             # shadcn/ui components
  features/
    auth/
    dashboard/      # 내 라이브러리: folders, search, upload, PDF grid
    pdf/
    explanation/
    quiz/
    blank-study/
    review/         # study session, review mode
    tutor/
  lib/
    api/            # API client (Spring Boot 연동 준비)
    mocks/          # Mock data layer
    utils/
  hooks/
  types/
  constants/
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8080` |
| `NEXT_PUBLIC_USE_MOCK` | Use mock data | `true` |

## Branch Strategy

- `main` — production
- `develop` — development integration
- `feat/*`, `fix/*` — feature branches from `develop`
