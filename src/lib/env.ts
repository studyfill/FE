// 환경변수 단일 진입점. 컴포넌트/훅/서버 코드는 process.env 대신 여기서 import 한다.
//  - NEXT_PUBLIC_* 는 빌드 시점에 번들로 인라인된다(리터럴 참조 필수).
//  - 시크릿(client_secret / JWT_SECRET 등)은 백엔드 전용 → 여기 두지 않는다.
// 값 정의·설명은 .env.example, 로컬 값은 .env.local 참조.

/** 백엔드 API base URL (끝에 / 없음). 예: http://localhost:8080 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"

/** 프론트 자기 도메인. redirect_uri 폴백 구성 등에 사용. */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

/** Google OAuth client_id (공개값). 미설정 시 mock 로그인 폴백. */
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""

/**
 * 구글 동의 화면 redirect_uri.
 * 백엔드 GOOGLE_REDIRECT_URI · Google Console 승인 URI 와 반드시 동일해야 한다.
 * 미설정 시 ${APP_URL}/auth/callback 로 구성.
 */
export const GOOGLE_REDIRECT_URI =
  process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ?? `${APP_URL}/auth/callback`

/** "true" 이면 src/lib/mocks 데이터 사용. 실 백엔드 연동 시 false. */
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true"
