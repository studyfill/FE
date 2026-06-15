// 서버 사이드 세션 쿠키(httpOnly) 헬퍼.
// 백엔드 토큰 교환 결과(user + accessToken/refreshToken)를 httpOnly 쿠키에 보관한다.
// 토큰을 localStorage 가 아닌 httpOnly 쿠키에 두어 JS 노출(XSS)을 피하는 BFF 방식.
// 서버 컴포넌트/미들웨어가 이 쿠키로 접근 제어·사용자 표시를 한다.

import { cookies } from "next/headers"

import { SESSION_COOKIE } from "@/constants/auth"
import type { Session } from "@/types/auth"

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7

/** 쿠키에 저장되는 세션 (name 필수) */
export type StoredSession = Session & { name: string }

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
}

export const serializeSession = (session: StoredSession): string =>
  JSON.stringify(session)

/** 서버 액션용 — next/headers cookies() 로 설정 */
export const setSessionCookie = async (session: StoredSession) => {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, serializeSession(session), sessionCookieOptions)
}

export const clearSessionCookie = async () => {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export const getServerSession = async (): Promise<StoredSession | null> => {
  const cookieStore = await cookies()
  const raw = cookieStore.get(SESSION_COOKIE)?.value
  if (!raw) return null

  try {
    return JSON.parse(raw) as StoredSession
  } catch {
    return null
  }
}
