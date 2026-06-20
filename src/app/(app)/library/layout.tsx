import type { ReactNode } from "react"

type LibraryLayoutProps = {
  children: ReactNode
  params?: Promise<Record<string, never>>
}

export default function LibraryLayout({ children }: LibraryLayoutProps) {
  return <>{children}</>
}
