// 세션의 순수 파싱·판정 헬퍼 (next/headers 비의존 → 미들웨어/엣지에서도 import 가능).
// cookies() 기반 읽기/쓰기는 session.ts 에 둔다.

import type { Session } from "@/types/auth"

/** 쿠키에 저장되는 세션 (name 필수) */
export type StoredSession = Session & { name: string }

/** 쿠키 raw 값 → 세션. 비었거나 파싱 실패면 null. */
export const parseSessionValue = (
  raw: string | undefined,
): StoredSession | null => {
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredSession
  } catch {
    return null
  }
}

/**
 * "로그인된 상태"로 볼지 판정.
 * 게스트 세션이거나, google 세션이면 accessToken 을 가진 경우만 인증으로 본다.
 * (이름만 있고 토큰이 없는 오래된/깨진 쿠키는 인증으로 보지 않아 랜딩으로 보낸다.)
 */
export const isSessionAuthenticated = (
  session: StoredSession | null,
): boolean => {
  if (!session) return false
  if (session.isGuest) return true
  return Boolean(session.accessToken)
}
