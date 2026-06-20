"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"

type StudyTabsProps = {
  userFileId: string
}

export const StudyTabs = ({ userFileId }: StudyTabsProps) => {
  const pathname = usePathname()
  const base = ROUTES.study(userFileId)

  const tabs = [
    { href: base, label: "PDF 뷰어", match: (p: string) => p === base },
    {
      href: ROUTES.studyNote(userFileId),
      label: "강의식 설명",
      match: (p: string) => p.includes("/note"),
    },
    {
      href: ROUTES.studyBlank(userFileId),
      label: "빈칸 암기",
      match: (p: string) => p.includes("/blank"),
    },
  ]

  return (
    <nav
      className="flex gap-1 border-b border-border"
      aria-label="학습 탭"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-sm transition-colors",
            tab.match(pathname)
              ? "border-primary font-medium text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
