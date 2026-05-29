import type { ReactNode } from "react"

import { StudyShell } from "@/features/study/components/StudyShell"

type StudyLayoutProps = {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function StudyLayout({
  children,
  params,
}: StudyLayoutProps) {
  const { id } = await params

  return <StudyShell materialId={id}>{children}</StudyShell>
}
