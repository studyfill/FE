"use server"

import { redirect } from "next/navigation"

import { GUEST_DISPLAY_NAME, GUEST_USER_ID } from "@/constants/auth"
import { ROUTES } from "@/constants/routes"
import {
  clearSessionCookie,
  setSessionCookie,
} from "@/features/auth/session"
import {
  createMockGoogleProfile,
  mapGoogleProfileToSession,
} from "@/lib/auth/google"
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } from "@/lib/env"

export const enterGuestModeAction = async () => {
  await setSessionCookie({
    userId: GUEST_USER_ID,
    email: "",
    name: GUEST_DISPLAY_NAME,
    provider: "guest",
    isGuest: true,
  })
  redirect(ROUTES.library)
}

export const googleSignInAction = async () => {
  const clientId = GOOGLE_CLIENT_ID

  // client_id 미설정(로컬 등) → mock 로그인 폴백
  if (!clientId) {
    const profile = createMockGoogleProfile()
    await setSessionCookie(mapGoogleProfileToSession(profile))
    redirect(ROUTES.library)
  }

  // Authorization Code 발급 → /auth/callback 에서 백엔드와 code 교환
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  })
  redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
}

export const logoutAction = async () => {
  await clearSessionCookie()
  redirect(ROUTES.home)
}
