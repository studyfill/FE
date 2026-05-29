import type { ReactNode } from "react"

import { AppNav } from "@/components/layout/AppNav"
import { getServerSession } from "@/features/auth/actions"

type AppLayoutProps = {
  children: ReactNode
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await getServerSession()

  return (
    <div className="flex min-h-full flex-col bg-background">
      <AppNav userName={session?.name} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  )
}
