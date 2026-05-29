import type { ReactNode } from "react"

type AppShellProps = {
  children: ReactNode
}

export const AppShell = ({ children }: AppShellProps) => {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-12 max-w-5xl items-center px-4">
          <span className="text-sm font-semibold tracking-tight">StudyFill</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  )
}
