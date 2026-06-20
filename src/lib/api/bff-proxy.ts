// 서버 전용 BFF 프록시 헬퍼.
// 라우트 핸들러(src/app/api/**)에서 httpOnly 세션 쿠키의 accessToken 을 읽어
// 백엔드(/api/v1/**)로 Bearer 첨부해 프록시한다. 토큰을 JS(client)에 노출하지 않는다.
// raw fetch 는 server 계층(라우트 핸들러)에서 정당하다(check-direct-fetch 훅 제외 대상).
//
// 토큰 만료(401) 시 쿠키의 refreshToken 으로 /auth/refresh 를 1회 호출해 세션 쿠키를
// 갱신하고 재시도한다. 갱신 실패 시 세션 쿠키를 정리해 깨진 인증 상태에 갇히지 않게 한다.

import {
  clearSessionCookie,
  getServerSession,
  setSessionCookie,
} from "@/features/auth/session"
import type { AuthResponse } from "@/lib/api/types"

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
const API_PREFIX = "/api/v1"

/** 미인증 응답(백엔드 래퍼 형식 유지 → bffFetch 가 ApiError 로 처리). */
export const unauthorized = (): Response =>
  Response.json(
    { success: false, data: null, code: "AUTH_001", message: "로그인이 필요합니다" },
    { status: 401 },
  )

/** 백엔드 base origin 여부 (download-url 이 backend 스트리밍인지 외부 presigned 인지 구분). */
export const isBackendUrl = (url: string): boolean =>
  url.startsWith(BACKEND_BASE)

type AuthedFetchInit = {
  method: string
  search?: URLSearchParams
  headers?: Record<string, string>
  body?: BodyInit
}

/** refreshToken 으로 토큰 재발급. 성공 시 새 토큰들을, 실패 시 null. */
const refreshTokens = async (
  refreshToken: string,
): Promise<AuthResponse | null> => {
  try {
    const res = await fetch(`${BACKEND_BASE}${API_PREFIX}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
    const body = (await res.json().catch(() => null)) as
      | { success?: boolean; data?: AuthResponse }
      | null
    if (!res.ok || !body?.success || !body.data?.accessToken) return null
    return body.data
  } catch {
    return null
  }
}

/**
 * 인증된 백엔드 요청. 401 이면 refreshToken 으로 1회 갱신·쿠키 업데이트 후 재시도한다.
 * 미인증(세션/토큰 없음)이거나 갱신 실패 시 쿠키를 정리하고 null 을 반환한다(호출부 → unauthorized).
 */
export const authedBackendFetch = async (
  path: string,
  init: AuthedFetchInit,
): Promise<Response | null> => {
  const session = await getServerSession()
  if (!session?.accessToken) return null

  const qs =
    init.search && [...init.search.keys()].length > 0
      ? `?${init.search.toString()}`
      : ""
  const url = `${BACKEND_BASE}${API_PREFIX}${path}${qs}`

  const send = (token: string): Promise<Response> =>
    fetch(url, {
      method: init.method,
      headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}` },
      body: init.body,
    })

  const res = await send(session.accessToken)
  if (res.status !== 401) return res

  // 401 → refreshToken 으로 1회 갱신 시도
  if (!session.refreshToken) {
    await clearSessionCookie()
    return null
  }
  const refreshed = await refreshTokens(session.refreshToken)
  if (!refreshed?.accessToken) {
    await clearSessionCookie()
    return null
  }

  await setSessionCookie({
    ...session,
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken ?? session.refreshToken,
    expiresIn: refreshed.expiresIn ?? session.expiresIn,
  })
  return send(refreshed.accessToken)
}

type ProxyInit = {
  method: string
  search?: URLSearchParams
  jsonBody?: unknown
  formBody?: FormData
}

/** 백엔드로 프록시하고 응답(JSON 래퍼)을 그대로 전달한다. 미인증이면 unauthorized(). */
export const backendProxy = async (
  path: string,
  { method, search, jsonBody, formBody }: ProxyInit,
): Promise<Response> => {
  const headers: Record<string, string> = {}
  let body: BodyInit | undefined
  if (jsonBody !== undefined) {
    headers["Content-Type"] = "application/json"
    body = JSON.stringify(jsonBody)
  } else if (formBody) {
    body = formBody // multipart boundary 는 fetch 가 설정하도록 Content-Type 미지정
  }

  const res = await authedBackendFetch(path, { method, search, headers, body })
  if (!res) return unauthorized()

  const text = await res.text()
  return new Response(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    },
  })
}
