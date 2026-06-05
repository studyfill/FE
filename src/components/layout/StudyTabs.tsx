"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"

type StudyTabsProps = {
  materialId: string
}

export const StudyTabs = ({ materialId }: StudyTabsProps) => {
  const pathname = usePathname()
  const base = ROUTES.study(materialId)

  const tabs = [
    { href: base, label: "PDF 뷰어", match: (p: string) => p === base },
    {
      href: ROUTES.studyExplanation(materialId),
      label: "강의식 설명",
      match: (p: string) => p.includes("/explanation"),
    },
    {
      href: ROUTES.studyBlankStudy(materialId),
      label: "빈칸 암기",
      match: (p: string) => p.includes("/blank-study"),
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
