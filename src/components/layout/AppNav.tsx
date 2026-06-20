"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/constants"
import { ROUTES } from "@/constants/routes"
import { logoutAction } from "@/features/auth/actions"
import { cn } from "@/lib/utils"

type AppNavProps = {
  userName?: string
}

const navItems = [{ href: ROUTES.library, label: "내 라이브러리" }]

export const AppNav = ({ userName }: AppNavProps) => {
  const pathname = usePathname()

  const handleLogout = () => {
    void logoutAction()
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link
            href={ROUTES.library}
            className="text-sm font-semibold tracking-tight"
          >
            {APP_NAME}
          </Link>
          <nav className="flex items-center gap-1" aria-label="주요 메뉴">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-muted font-medium text-foreground"
                    : ""
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {userName ? (
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {userName}
            </span>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            aria-label="로그아웃"
          >
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  )
}
