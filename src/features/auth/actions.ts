"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  GUEST_DISPLAY_NAME,
  GUEST_USER_ID,
  SESSION_COOKIE,
} from "@/constants/auth"
import { ROUTES } from "@/constants/routes"
import {
  createMockGoogleProfile,
  mapGoogleProfileToSession,
} from "@/lib/auth/google"
import type { Session } from "@/types/auth"

const setSessionCookie = async (session: Session & { name: string }) => {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export const enterGuestModeAction = async () => {
  await setSessionCookie({
    userId: GUEST_USER_ID,
    email: "",
    name: GUEST_DISPLAY_NAME,
    provider: "guest",
    isGuest: true,
  })
  redirect(ROUTES.dashboard)
}

export const googleSignInAction = async () => {
  const hasGoogleOAuth =
    Boolean(process.env.GOOGLE_CLIENT_ID) &&
    Boolean(process.env.GOOGLE_CLIENT_SECRET)

  if (!hasGoogleOAuth) {
    const profile = createMockGoogleProfile()
    await setSessionCookie(mapGoogleProfileToSession(profile))
    redirect(ROUTES.dashboard)
  }

  redirect("/api/auth/google")
}

export const logoutAction = async () => {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect(ROUTES.home)
}

export const getServerSession = async (): Promise<
  (Session & { name: string }) | null
> => {
  const cookieStore = await cookies()
  const raw = cookieStore.get(SESSION_COOKIE)?.value
  if (!raw) return null

  try {
    return JSON.parse(raw) as Session & { name: string }
  } catch {
    return null
  }
}
