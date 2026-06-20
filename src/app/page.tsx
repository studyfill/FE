import { redirect } from "next/navigation"

import { ROUTES } from "@/constants/routes"
import { getServerSession } from "@/features/auth/session"
import { isSessionAuthenticated } from "@/features/auth/session-core"
import { LandingPage } from "@/features/landing/components/LandingPage"

export default async function HomePage() {
  const session = await getServerSession()
  if (isSessionAuthenticated(session)) {
    redirect(ROUTES.dashboard)
  }

  return <LandingPage />
}
