export type User = {
  id: string
  email: string
  name: string
}

export type AuthProvider = "google" | "guest"

export type Session = {
  userId: string
  email: string
  name?: string
  provider?: AuthProvider
  isGuest?: boolean
  picture?: string
  // 백엔드 토큰 (Google Authorization Code 교환 결과). 게스트/mock 세션엔 없음.
  accessToken?: string
  refreshToken?: string
  expiresIn?: number
}
