import type { ReactNode } from "react"

import { AppLayoutShell } from "@/components/layout/AppLayoutShell"
import { getServerSession } from "@/features/auth/actions"

type AppLayoutProps = {
  children: ReactNode
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await getServerSession()

  return (
    <AppLayoutShell userName={session?.name}>{children}</AppLayoutShell>
  )
}
