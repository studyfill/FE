"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Sparkles } from "lucide-react"

import { ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"

type StudyFeatureTabsProps = {
  materialId: string
}

export const StudyFeatureTabs = ({ materialId }: StudyFeatureTabsProps) => {
  const pathname = usePathname()

  const tabs = [
    {
      href: ROUTES.study(materialId),
      label: "쉽게 설명",
      icon: Sparkles,
      match: (path: string) =>
        path === ROUTES.study(materialId) || path.includes("/explanation"),
    },
    {
      href: ROUTES.studyBlankStudy(materialId),
      label: "빈칸 암기",
      icon: BookOpen,
      match: (path: string) => path.includes("/blank-study"),
    },
  ]

  return (
    <nav
      className="flex shrink-0 gap-1 border-b border-border px-4"
      aria-label="학습 기능 탭"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = tab.match(pathname)

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm transition-colors",
              isActive
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
