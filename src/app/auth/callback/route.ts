// Google Authorization Code 콜백 (서버 라우트 핸들러).
// 구글이 redirect_uri(= 이 경로)로 보낸 code 를 받아 백엔드와 교환하고,
// 결과(user + tokens)를 httpOnly 세션 쿠키에 저장한 뒤 대시보드로 보낸다.
// redirect_uri 는 백엔드 GOOGLE_REDIRECT_URI · Google Console 승인 URI 와 동일해야 한다.

import { NextResponse } from "next/server"

import { SESSION_COOKIE } from "@/constants/auth"
import { ROUTES } from "@/constants/routes"
import { serializeSession, sessionCookieOptions } from "@/features/auth/session"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"

type BackendAuthData = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: { id: string; email: string; name: string; profileImageUrl?: string }
}

export const GET = async (request: Request) => {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const oauthError = url.searchParams.get("error")
  const homeWithError = new URL(`${ROUTES.home}?auth_error=1`, url.origin)

  if (oauthError || !code) {
    return NextResponse.redirect(homeWithError)
  }

  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
    const body = (await res.json().catch(() => null)) as {
      success?: boolean
      data?: BackendAuthData
    } | null

    if (!body?.success || !body.data) {
      return NextResponse.redirect(homeWithError)
    }

    const { accessToken, refreshToken, expiresIn, user } = body.data
    const response = NextResponse.redirect(new URL(ROUTES.dashboard, url.origin))
    response.cookies.set(
      SESSION_COOKIE,
      serializeSession({
        userId: user.id,
        email: user.email,
        name: user.name,
        provider: "google",
        picture: user.profileImageUrl,
        accessToken,
        refreshToken,
        expiresIn,
      }),
      sessionCookieOptions,
    )
    return response
  } catch {
    return NextResponse.redirect(homeWithError)
  }
}
