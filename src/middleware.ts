import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { SESSION_COOKIE } from "@/constants/auth"
import { PROTECTED_PREFIXES, ROUTES } from "@/constants/routes"
import {
  isSessionAuthenticated,
  parseSessionValue,
} from "@/features/auth/session-core"

const LEGACY_AUTH_PATHS = ["/login", "/signup"]

const isProtectedPath = (pathname: string) =>
  PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl
  // 쿠키 "존재"가 아니라 유효성(게스트거나 토큰 보유)으로 판정 — 이름만 있고 토큰이 없는
  // 깨진/오래된 쿠키는 미인증으로 보아 랜딩으로 보낸다.
  const authed = isSessionAuthenticated(
    parseSessionValue(request.cookies.get(SESSION_COOKIE)?.value)
  )

  if (LEGACY_AUTH_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL(ROUTES.home, request.url))
  }

  if (isProtectedPath(pathname) && !authed) {
    return NextResponse.redirect(new URL(ROUTES.home, request.url))
  }

  if (pathname === ROUTES.home && authed) {
    return NextResponse.redirect(new URL(ROUTES.library, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/library/:path*",
    "/dashboard/:path*",
    "/materials/:path*",
    "/study/:path*",
    "/api/auth/:path*",
  ],
}
