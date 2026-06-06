"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  GUEST_DISPLAY_NAME,
  GUEST_USER_ID,
  MOCK_PASSWORD,
  SESSION_COOKIE,
} from "@/constants/auth"
import { ROUTES } from "@/constants/routes"
import { findUserByEmail, registerMockUser } from "@/lib/mocks/auth"
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
    isGuest: true,
  })
  redirect(ROUTES.dashboard)
}

export const loginAction = async (formData: FormData) => {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해 주세요." }
  }

  if (password !== MOCK_PASSWORD) {
    return { error: "비밀번호가 올바르지 않습니다. (mock: studyfill123)" }
  }

  let user = findUserByEmail(email)
  if (!user) {
    user = registerMockUser(email, email.split("@")[0])
  }

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
  })
  redirect(ROUTES.dashboard)
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
