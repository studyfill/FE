# Auth (도메인 가이드)

Phase A 인증: **Google OAuth(백엔드 토큰 교환) + 게스트 데모**. (이메일 mock 로그인은 제거됨)
프로젝트 전역 연동/토큰 규칙은 루트 `CLAUDE.md`, 백엔드 계약은 `API_INTEGRATION.md` 참조.

## 세션 모델 — 서버 BFF + httpOnly 쿠키

토큰을 localStorage 가 아닌 **httpOnly 쿠키**(`sf-session`)에 담는 BFF 방식. 토큰이 JS에 노출되지
않으며, 서버 컴포넌트(`getServerSession`)·미들웨어가 이 쿠키로 접근 제어/사용자 표시를 한다.

- 세션 헬퍼: `src/features/auth/session.ts` — `getServerSession` / `setSessionCookie` /
  `clearSessionCookie` / `serializeSession` / `sessionCookieOptions` (쿠키 상수는 `@/constants/auth`)
- 서버 액션: `actions.ts` — `googleSignInAction` / `enterGuestModeAction` / `logoutAction`
- 클라 훅: `hooks/useGoogleSignIn.ts`, `hooks/useEnterGuestMode.ts` (`useTransition` + 서버 액션)
- 미들웨어: `src/middleware.ts` — `PROTECTED_PREFIXES` 보호, 쿠키 유무로 리다이렉트

## Google 로그인 플로우 (Authorization Code)

1. `googleSignInAction` → 구글 동의 화면으로 redirect
   (`client_id=NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `redirect_uri=NEXT_PUBLIC_GOOGLE_REDIRECT_URI`,
   `response_type=code`, `scope=openid email profile`)
2. 구글 → `/auth/callback?code=...` (`src/app/auth/callback/route.ts`, 서버 라우트 핸들러)
3. 콜백이 `POST {NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/google { code }` 호출 → 백엔드가 client_secret 으로
   교환·JWT 발급 → `{ accessToken, refreshToken, expiresIn, user }`
4. 응답을 httpOnly 세션 쿠키에 저장 후 대시보드로 redirect. 실패 시 `/?auth_error=1`

> `redirect_uri`(`NEXT_PUBLIC_GOOGLE_REDIRECT_URI`)는 **백엔드 `GOOGLE_REDIRECT_URI` · Google Console
> 승인 URI 와 반드시 동일**해야 한다. FE 경로는 `/auth/callback`.

## 폴백 / 게스트

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 미설정 시 `googleSignInAction`이 **mock 로그인**으로 폴백
  (`src/lib/auth/google.ts`의 `createMockGoogleProfile`) — 로컬 개발용
- 게스트 모드(`isGuest`)는 로컬 mock 데이터로 동작, 백엔드 호출 없음

## 규칙 / 주의

- **시크릿 금지**: `GOOGLE_CLIENT_SECRET`/`JWT_SECRET`은 백엔드 전용. 프론트(특히 `NEXT_PUBLIC_*`)에 두지 않는다.
- 직접 `fetch`는 라우트 핸들러(`route.ts`) / 서버 액션 / `src/lib/auth/**`에서만 (그 외는 `apiFetch`)
- **미해결**: 백엔드 `GOOGLE_REDIRECT_URI` 기본값이 develop 프리뷰 도메인 `.../auth/callback`로 설정돼 있어,
  로그인은 그 도메인에서만 일관 동작. 안정적 운영을 위해 단일 도메인으로 통일 권장. [[deployment-oauth-state]]
- 클라이언트 측 인증 API 호출이 필요해지면: `src/lib/api/client.ts`(`apiFetch`)는 localStorage 토큰을
  가정하므로, 현재 httpOnly 쿠키 모델과는 별도 정렬(서버 프록시 또는 토큰 노출 정책)이 필요하다.
- CTA 정합: `src/features/landing/CLAUDE.md`(로그인=AuthDialog, 무료시작=게스트)
