import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { SESSION_COOKIE } from "@/constants/auth"
import { PROTECTED_PREFIXES, ROUTES } from "@/constants/routes"

const isProtectedPath = (pathname: string) =>
  PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl
  const session = request.cookies.get(SESSION_COOKIE)?.value

  if (isProtectedPath(pathname) && !session) {
    const loginUrl = new URL(ROUTES.login, request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if ((pathname === ROUTES.login || pathname === ROUTES.signup) && session) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url))
  }

  if (pathname === ROUTES.home && session) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/login", "/signup", "/dashboard/:path*", "/materials/:path*", "/study/:path*"],
}
