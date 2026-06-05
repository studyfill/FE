"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { AppNav } from "@/components/layout/AppNav"

type AppLayoutShellProps = {
  children: ReactNode
  userName?: string
}

const isDashboardPath = (pathname: string) =>
  pathname === "/dashboard" || pathname.startsWith("/dashboard/")

const isStudyPath = (pathname: string) => pathname.startsWith("/study/")

export const AppLayoutShell = ({ children, userName }: AppLayoutShellProps) => {
  const pathname = usePathname()
  const hideNav = isDashboardPath(pathname) || isStudyPath(pathname)

  if (hideNav) {
    return (
      <div className="flex h-svh flex-col overflow-hidden bg-background">
        {children}
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col bg-background">
      <AppNav userName={userName} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  )
}
