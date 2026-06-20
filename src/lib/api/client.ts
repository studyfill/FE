// 모든 백엔드 호출의 단일 진입점. 컴포넌트/훅에서 직접 fetch 하지 말고 여기로만 호출한다.
//  - 공통 래퍼({success,data,code,message}) 언래핑
//  - Authorization 헤더 자동 첨부
//  - 실패 시 ApiError(code) throw
//  - 401(AUTH_002 만료) 시 /auth/refresh 로 1회 자동 갱신 후 재시도

import {
  ApiError,
  type ApiResponse,
  ErrorCode,
  REAUTH_REQUIRED_CODES,
} from "./errors"
import { ROUTES } from "@/constants/routes"
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "./auth"

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
const API_PREFIX = "/api/v1"

type FetchInit = Omit<RequestInit, "body"> & { body?: unknown }

/** 동시 다발 401 시 refresh 중복 호출 방지 */
let refreshPromise: Promise<boolean> | null = null

const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${BASE}${API_PREFIX}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        })
        const body = (await res.json()) as ApiResponse<{
          accessToken: string
          refreshToken: string
        }>
        if (!body.success || !body.data) return false
        setTokens(body.data)
        return true
      } catch {
        return false
      }
    })()
  }

  const ok = await refreshPromise
  refreshPromise = null
  return ok
}

const rawFetch = async <T>(
  path: string,
  init?: FetchInit,
  retry = true,
): Promise<ApiResponse<T>> => {
  const token = getAccessToken()
  const isFormData = init?.body instanceof FormData

  const res = await fetch(`${BASE}${API_PREFIX}${path}`, {
    ...init,
    headers: {
      // FormData면 Content-Type 을 브라우저가 boundary 와 함께 설정하도록 비워둠
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    body: isFormData
      ? (init?.body as FormData)
      : init?.body != null
        ? JSON.stringify(init.body)
        : undefined,
  })

  const body = (await res.json().catch(() => null)) as ApiResponse<T> | null

  // 토큰 만료 → 1회 자동 갱신 후 재시도
  if (retry && res.status === 401 && body?.code === ErrorCode.AUTH_TOKEN_EXPIRED) {
    const refreshed = await refreshAccessToken()
    if (refreshed) return rawFetch<T>(path, init, false)
    clearTokens()
  }

  if (!body) {
    throw new ApiError(
      ErrorCode.COMMON_INTERNAL_ERROR,
      "응답을 해석할 수 없습니다",
      res.status,
    )
  }
  if (!body.success) {
    throw new ApiError(body.code, body.message, res.status)
  }
  return body
}

/** JSON 응답을 받는 표준 호출. data 만 반환. */
export const apiFetch = async <T>(
  path: string,
  init?: FetchInit,
): Promise<T> => {
  const body = await rawFetch<T>(path, init)
  return body.data as T
}

/** PDF 등 바이너리 응답 전용 (export API). 래퍼를 거치지 않음. */
export const apiFetchBlob = async (
  path: string,
  init?: Omit<RequestInit, "body">,
): Promise<Blob> => {
  const token = getAccessToken()
  const res = await fetch(`${BASE}${API_PREFIX}${path}`, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })
  if (!res.ok) {
    // 에러는 JSON 래퍼로 내려올 수 있음
    const body = (await res.json().catch(() => null)) as ApiResponse<unknown> | null
    throw new ApiError(
      body?.code ?? ErrorCode.COMMON_INTERNAL_ERROR,
      body?.message ?? "다운로드 실패",
      res.status,
    )
  }
  return res.blob()
}

// ── BFF (same-origin) ────────────────────────────────────────────
// 서버 라우트 핸들러(src/app/api/**)가 httpOnly 세션 쿠키의 토큰을 읽어 백엔드로 프록시한다.
// 클라이언트는 same-origin 으로 호출 → 쿠키가 자동 전송되고 Authorization 을 직접 다루지 않는다.
// (토큰을 JS 에 노출하지 않는 BFF 모델. 백엔드 직접 호출은 apiFetch, BFF 경유는 bffFetch.)
const BFF_PREFIX = "/api"

// 세션 토큰 갱신까지 실패(쿠키 정리됨)한 BFF 401 → 랜딩으로 유도해 재로그인.
// (만료 후 자동 갱신 성공 시엔 200 이 와서 여기로 오지 않는다.)
const redirectIfReauthRequired = (status: number, code: string): void => {
  if (typeof window === "undefined") return
  if (status === 401 && REAUTH_REQUIRED_CODES.has(code)) {
    window.location.href = ROUTES.home
  }
}

export const bffFetch = async <T>(
  path: string,
  init?: FetchInit,
): Promise<T> => {
  const isFormData = init?.body instanceof FormData

  const res = await fetch(`${BFF_PREFIX}${path}`, {
    ...init,
    headers: {
      ...(isFormData || init?.body == null
        ? {}
        : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
    body: isFormData
      ? (init?.body as FormData)
      : init?.body != null
        ? JSON.stringify(init.body)
        : undefined,
  })

  const body = (await res.json().catch(() => null)) as ApiResponse<T> | null
  if (!body) {
    throw new ApiError(
      ErrorCode.COMMON_INTERNAL_ERROR,
      "응답을 해석할 수 없습니다",
      res.status,
    )
  }
  if (!body.success) {
    redirectIfReauthRequired(res.status, body.code)
    throw new ApiError(body.code, body.message, res.status)
  }
  return body.data as T
}

/** BFF 경유 바이너리(blob) 호출. 래퍼 없이 바이트를 받는다(파일 원본 스트리밍용). */
export const bffFetchBlob = async (
  path: string,
  init?: Omit<RequestInit, "body">,
): Promise<Blob> => {
  const res = await fetch(`${BFF_PREFIX}${path}`, init)
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiResponse<unknown> | null
    const code = body?.code ?? ErrorCode.COMMON_INTERNAL_ERROR
    redirectIfReauthRequired(res.status, code)
    throw new ApiError(code, body?.message ?? "파일을 가져오지 못했습니다", res.status)
  }
  return res.blob()
}

// 편의 메서드
export const api = {
  get: <T>(path: string, init?: FetchInit) =>
    apiFetch<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: unknown, init?: FetchInit) =>
    apiFetch<T>(path, { ...init, method: "POST", body }),
  put: <T>(path: string, body?: unknown, init?: FetchInit) =>
    apiFetch<T>(path, { ...init, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, init?: FetchInit) =>
    apiFetch<T>(path, { ...init, method: "PATCH", body }),
  delete: <T>(path: string, init?: FetchInit) =>
    apiFetch<T>(path, { ...init, method: "DELETE" }),
}
