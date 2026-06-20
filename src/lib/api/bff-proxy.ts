// 서버 전용 BFF 프록시 헬퍼.
// 라우트 핸들러(src/app/api/**)에서 httpOnly 세션 쿠키의 accessToken 을 읽어
// 백엔드(/api/v1/**)로 Bearer 첨부해 프록시한다. 토큰을 JS(client)에 노출하지 않는다.
// raw fetch 는 server 계층(라우트 핸들러)에서 정당하다(check-direct-fetch 훅 제외 대상).

import { getServerSession } from "@/features/auth/session"

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
const API_PREFIX = "/api/v1"

/** 세션 accessToken 조회. 게스트/미로그인 시 null. */
export const getSessionToken = async (): Promise<string | null> => {
  const session = await getServerSession()
  return session?.accessToken ?? null
}

/** 미인증 응답(백엔드 래퍼 형식 유지 → bffFetch 가 ApiError 로 처리). */
export const unauthorized = (): Response =>
  Response.json(
    { success: false, data: null, code: "AUTH_001", message: "로그인이 필요합니다" },
    { status: 401 },
  )

type ProxyInit = {
  method: string
  token: string
  search?: URLSearchParams
  jsonBody?: unknown
  formBody?: FormData
}

/** 백엔드 JSON 호출 → data 만 반환(서버 전용). 래퍼 실패 시 throw. */
export const backendJson = async <T>(
  path: string,
  token: string,
  init?: { method?: string },
): Promise<T> => {
  const res = await fetch(`${BACKEND_BASE}${API_PREFIX}${path}`, {
    method: init?.method ?? "GET",
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = (await res.json().catch(() => null)) as
    | { success?: boolean; data?: T }
    | null
  if (!res.ok || !body?.success) {
    throw new Error(`backend ${path} 실패: ${res.status}`)
  }
  return body.data as T
}

/** 백엔드 base origin 여부 (download-url 이 backend 스트리밍인지 외부 presigned 인지 구분). */
export const isBackendUrl = (url: string): boolean =>
  url.startsWith(BACKEND_BASE)

/** 백엔드로 프록시하고 응답(JSON 래퍼)을 그대로 전달한다. */
export const backendProxy = async (
  path: string,
  { method, token, search, jsonBody, formBody }: ProxyInit,
): Promise<Response> => {
  const qs =
    search && [...search.keys()].length > 0 ? `?${search.toString()}` : ""
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` }

  let body: BodyInit | undefined
  if (jsonBody !== undefined) {
    headers["Content-Type"] = "application/json"
    body = JSON.stringify(jsonBody)
  } else if (formBody) {
    body = formBody // multipart boundary 는 fetch 가 설정하도록 Content-Type 미지정
  }

  const res = await fetch(`${BACKEND_BASE}${API_PREFIX}${path}${qs}`, {
    method,
    headers,
    body,
  })

  const text = await res.text()
  return new Response(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    },
  })
}
