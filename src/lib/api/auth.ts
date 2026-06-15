// 토큰 저장/조회/갱신 헬퍼.
// 저장 전략은 보안 요구사항에 맞게 교체한다.
//  - 가장 단순: localStorage (XSS에 취약 → 데모/내부용)
//  - 권장: accessToken은 메모리, refreshToken은 httpOnly 쿠키(백엔드 협의 필요)
// 아래는 기본 동작이 되도록 localStorage 구현을 제공한다.
//
// 참고: 현재 FE 는 쿠키 기반 mock 세션(src/features/auth/actions.ts)을 사용 중이다.
// 백엔드 토큰 플로우로의 전환은 후속 작업이며, 이 파일은 그 토대다.

const ACCESS_KEY = "sf.accessToken"
const REFRESH_KEY = "sf.refreshToken"

export type AuthTokens = {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export type AuthUser = {
  id: string
  email: string
  name: string
  profileImageUrl?: string
}

const isBrowser = typeof window !== "undefined"

export const getAccessToken = (): string | null =>
  isBrowser ? localStorage.getItem(ACCESS_KEY) : null

export const getRefreshToken = (): string | null =>
  isBrowser ? localStorage.getItem(REFRESH_KEY) : null

export const setTokens = (
  tokens: Pick<AuthTokens, "accessToken" | "refreshToken">,
): void => {
  if (!isBrowser) return
  localStorage.setItem(ACCESS_KEY, tokens.accessToken)
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
}

export const clearTokens = (): void => {
  if (!isBrowser) return
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

/**
 * 구글 콜백에서 받은 authorization code 로 로그인.
 * apiFetch 가 아직 토큰이 없는 상태이므로 raw fetch 로 직접 호출한다(예외적).
 */
export const loginWithGoogleCode = async (
  code: string,
  baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
): Promise<{ tokens: AuthTokens; user: AuthUser }> => {
  const res = await fetch(`${baseUrl}/api/v1/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  })
  const body = await res.json()
  if (!body.success) {
    throw new Error(body.message ?? "구글 로그인에 실패했습니다")
  }
  const data = body.data as AuthTokens & { user: AuthUser }
  setTokens(data)
  return {
    tokens: {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
    },
    user: data.user,
  }
}
