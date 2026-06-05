import type { ReactNode } from "react"

import { APP_NAME } from "@/constants"

type AuthLayoutProps = {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-12 max-w-5xl items-center px-4">
          <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        {children}
      </main>
    </div>
  )
}
