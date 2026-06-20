# StudyFill Frontend — Claude Code Guide

StudyFill의 **Next.js 프론트엔드** 레포입니다. 백엔드(`studyfill/BE`)와 연동하며,
백엔드가 자동 생성하는 OpenAPI 스펙을 계약(contract)으로 사용합니다.

> 이 문서는 프로젝트 전반 규칙을 담습니다. 세부 컨벤션은 `docs/*.md`(frontend·git·product)와
> `.claude/skills/*/SKILL.md`에 정리돼 있으며, 충돌 시 이 문서를 우선합니다.

## 프로젝트 개요

- **서비스**: AI 기반 PDF/이미지 학습 플랫폼. 핵심 플로우(Phase A): 업로드 → AI 강의식 설명 → 빈칸 암기.
- **스택**: Next.js 16 (App Router) / React 19 / TypeScript / TailwindCSS 4 / shadcn/ui + Radix / lucide-react
- **패키지 매니저**: **pnpm** (npm/yarn 사용 금지)
- **백엔드**: Spring Boot, 별도 레포(`studyfill/BE`). HTTP REST + OpenAPI 계약.

## 제품 범위 (Phase)

- **활성: Phase A** — landing / auth(Google OAuth + 게스트) / library / pdf · note · blank.
  사용자 확인 없이 Phase B/C 기능을 구현하지 않는다.
- **Phase B(보류)**: quiz, review(오답노트), tutor, 과금 UI, 본문 검색
- **Phase C(보류)**: SSE 스트리밍, Vision OCR, 실결제, 모바일 전용 UI
- 상세 제품 맥락·화면↔feature 매핑: `docs/product.md`

## Build & Run

```bash
pnpm dev      # 개발 서버 (turbopack)
pnpm build    # 프로덕션 빌드
pnpm start    # 빌드 결과 실행
pnpm lint        # eslint
pnpm gen:api:prod # 배포 백엔드(Railway) OpenAPI → src/lib/api/schema.d.ts 타입 생성
pnpm gen:api      # 로컬 백엔드(localhost:8080)에서 생성
```

## 아키텍처

feature 기반 확장형 구조. UI와 비즈니스 로직을 분리하고, 컴포넌트는 작고 재사용 가능하게 유지한다.

```txt
src/
  app/                  # App Router (라우트, layout, route handlers)
  components/
    common/             # 공용 컴포넌트
    layout/             # 레이아웃 셸/네비게이션
    ui/                 # shadcn/ui 프리미티브
  features/             # 도메인별 기능 (landing, auth, library, pdf, note, blank, study, ...)
    <feature>/
      components/ hooks/ context/ types/ utils/
  lib/
    api/                # 백엔드 연동 계층 (아래 "디렉터리 규칙")
    mocks/              # 백엔드 연동 전 mock 데이터/스토어
    pdf/ storage/ utils/
  hooks/ types/ constants/
```

- 반복 로직은 hooks/utils로 추출. 거대한 page 컴포넌트 지양.
- 백엔드 연동 전에는 `src/lib/mocks/`의 mock을 사용한다.

## 코드 스타일

- TypeScript only. **세미콜론 없음**.
- `const` 화살표 함수 + 서술적 이름. 이벤트 핸들러는 `handle`로 시작 (`const handleSubmit = () => {}`).
- early return 우선, 영리함보다 가독성. TODO/placeholder/미완성 코드 남기지 않기.

## 스타일링 / UI 밀도

- TailwindCSS만 사용(별도 CSS 지양). shadcn/ui 컴포넌트 활용. 흰 배경·컴팩트·차분한 productivity SaaS 톤
  (Notion/Linear/Perplexity 지향, 다크모드·화려한 교육 UI 지양).
- **밀도 베이스라인**: `globals.css`의 `html { font-size: 80% }`. feature 코드에 새 `text-[Npx]`/`size-[Npx]`/
  레이아웃 px 리터럴 추가 금지 → `@theme` 토큰 사용 (`text-body`, `text-caption`, `w-sidebar`,
  `size-icon-md`, `rounded-button` 등). 상세는 `docs/frontend.md`.
- 언어: MVP는 한국어 UI만. i18n은 명시 요청 전까지 추가하지 않는다.
- 접근성: 아이콘 버튼에 `aria-label`, div 클릭보다 `<button>`.

## 백엔드 API 연동 규칙 (필수)

- **Base URL**: `${NEXT_PUBLIC_API_BASE_URL}/api/v1` (예: `http://localhost:8080/api/v1`)
- **인증**: `Authorization: Bearer {accessToken}` — `/auth/**` 외 모든 API 필수
- **응답 래퍼**: 모든 응답은 `{ success, data, code, message }` 평면 구조.
  → 컴포넌트/훅에서 **직접 `fetch` 금지**. 반드시 `apiFetch`로만 호출(언래핑·인증·에러 일원화).
  (예외: route handler `src/app/api/**`, 서버 액션, `src/lib/auth/**`는 raw fetch 정당 — 훅이 자동 제외)
- **타입**: 손으로 작성 금지. `src/lib/api/schema.d.ts`를 import. 갱신은 `/sync-api` 또는 `pnpm gen:api`.
- **에러 분기**: `apiFetch`가 던지는 `ApiError`의 `code`로 분기. 코드 상수는 `src/lib/api/errors.ts`
  (`ErrorCode.AUTH_002` 등), 전체 목록은 `ERROR_CODE.md`.
- **새 API 붙일 때**: ① **배포 백엔드 Swagger를 항상 먼저 확인**
  (Swagger UI `https://be-production-5944.up.railway.app/swagger-ui/index.html`,
  스펙 `https://be-production-5944.up.railway.app/v3/api-docs`)하여 엔드포인트·요청/응답 계약 확정 →
  ② 타입 재생성(`pnpm gen:api:prod` 또는 `/sync-api`) → ③ `apiFetch` 호출 작성. 임의 추측 금지.
  (로컬 백엔드를 직접 띄운 경우에만 `/v3/api-docs`(localhost) 사용)

## 인증 플로우 (Google Authorization Code)

1. 프론트가 구글 동의 화면에서 `code` 발급 (redirect_uri = `/auth/callback`, 백엔드 `ENV.md`와 동일)
2. `POST /auth/google { code }` → `{ accessToken, refreshToken, expiresIn, user }`
3. 토큰 저장은 `src/lib/api/auth.ts` 헬퍼 사용
4. 401(`AUTH_002` 만료) 응답 시 `apiFetch`가 `POST /auth/refresh`로 1회 자동 갱신 후 재시도
5. 갱신 실패(`AUTH_007`) 시 로그인 페이지로 유도

> **구현 상태**: Google 로그인은 백엔드 토큰 교환으로 연동됨 — 동의 화면 → `/auth/callback`
> (서버 라우트 핸들러) → `POST /api/v1/auth/google` → 결과를 **httpOnly 세션 쿠키**(BFF)에 저장.
> 토큰을 JS에 노출하지 않는다. `client_secret`/`JWT_SECRET`은 백엔드 전용(프론트 금지).
> 구현 세부·미해결 사항은 `src/features/auth/CLAUDE.md` 참조.

## 환경변수

`.env.local` (예시는 `.env.example`):
```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<백엔드 GOOGLE_CLIENT_ID와 동일>
```
> `redirect_uri`는 백엔드 `GOOGLE_REDIRECT_URI`와 **반드시 동일**해야 합니다.

## 디렉터리 규칙 — `src/lib/api/`

```
client.ts     # apiFetch / apiFetchBlob / api.* (직접 fetch 금지, 여기로만)
errors.ts     # ApiError + ApiResponse/Page 타입 + ErrorCode 상수
auth.ts       # 토큰 저장/조회/갱신, loginWithGoogleCode
upload.ts     # multipart 업로드 (전방 스텁 — files 도메인 미배포)
schema.d.ts   # 백엔드 OpenAPI 생성 타입(커밋함) — 직접 수정 금지, /sync-api 로 갱신
types.ts      # schema.d.ts 의 도메인 타입 편의 별칭 (여기서 import)
```

> 배포 백엔드 현황: **auth / users / folders** 구현됨. files·analysis·note·blank·export 는 미배포(`API_INTEGRATION.md` §9).

## Hooks (`.claude/settings.json`)

- **PostToolUse** (`.ts/.tsx` Edit/Write):
  - `check-direct-fetch.ps1` — `apiFetch` 우회한 직접 `fetch(` 감지 시 경고 (server 계층은 제외)
  - `check-schema-fresh.ps1` — `schema.d.ts`가 없거나 오래됐으면 `/sync-api` 유도

## Skills

- `/sync-api` — 백엔드 OpenAPI 스펙에서 TS 타입(`schema.d.ts`) 재생성 후 컴파일 영향 확인
- 그 외: `/code-review` `/security-review` `/run` 등 내장 스킬

## Git 워크플로

세부는 `docs/git.md`. 요약:

- 모든 작업은 `develop`에서 분기. 브랜치: `<type>/<scope>-<kebab-desc>` (예: `feat/blank-study-answer-check`)
- 타입: `feat` `fix` `refactor` `chore` `docs` `test` / 스코프: feature 폴더명 + `ui` `lib` `deps`
- 커밋/이슈/PR **제목은 영문** `<type>(<scope>): <imperative>`, **본문은 한국어**(템플릿 형식)
- PR base는 `develop` (release/deploy만 `main`). PR 본문 마지막에 `Closes #N`
- **이슈/커밋/푸시/PR은 명시 요청 시에만** 수행

## 도메인별 가이드

각 feature 폴더의 `CLAUDE.md`는 해당 폴더 파일을 열 때 자동 로드된다. 도메인 작업 시 그 파일을 따른다.

| 도메인 | 가이드 |
|--------|--------|
| 인증 (OAuth·게스트·세션) | `src/features/auth/CLAUDE.md` |
| 라이브러리 (파일·폴더·업로드) | `src/features/library/CLAUDE.md` |
| 랜딩 (마케팅·정직성) | `src/features/landing/CLAUDE.md` |
| 학습 탭 공통 (split-pane·생성패널) | `src/features/study/CLAUDE.md` |
| 빈칸 학습 | `src/features/blank/CLAUDE.md` |
| 쉽게 설명 | `src/features/note/CLAUDE.md` |

> 위 각 feature 폴더의 `CLAUDE.md`가 해당 도메인의 단일 소스다.

## 문서 참조

| 문서 | 시점 |
|------|------|
| `API_INTEGRATION.md` | 연동 상세 (래퍼·인증·업로드·폴링·export·CORS) |
| `ERROR_CODE.md` | 에러/성공 코드 분기 |
| `docs/frontend.md` | 스택·구조·UI·코드 스타일 상세 |
| `docs/git.md` | git 컨벤션 상세 |
| `docs/product.md` | 제품 맥락·Phase 범위 |
| `.claude/skills/*/SKILL.md` | 대규모 feature 작업 스킬 |
| 백엔드 `API_SPEC.md` / `/swagger-ui.html` | 엔드포인트 명세 / 실행 중 API 확인 |
