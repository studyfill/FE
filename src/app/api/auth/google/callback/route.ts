import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { SESSION_COOKIE } from "@/constants/auth"
import { ROUTES } from "@/constants/routes"
import {
  createMockGoogleProfile,
  mapGoogleProfileToSession,
} from "@/lib/auth/google"

export const GET = async (request: Request) => {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const origin = url.origin

  if (!code || !process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.redirect(new URL(ROUTES.home, origin))
  }

  // Phase A: token exchange with backend can replace this mock fallback.
  const profile = createMockGoogleProfile()
  const session = mapGoogleProfileToSession(profile)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  return NextResponse.redirect(new URL(ROUTES.dashboard, origin))
}
