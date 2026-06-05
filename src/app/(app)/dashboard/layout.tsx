import type { ReactNode } from "react"

type DashboardLayoutProps = {
  children: ReactNode
  params?: Promise<Record<string, never>>
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <>{children}</>
}
