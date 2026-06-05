"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Layers } from "lucide-react"

import { ExplanationGenerateIcon } from "@/features/explanation/components/ExplanationGenerateIcon"
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
      generateIcon: true,
      match: (path: string) =>
        path === ROUTES.study(materialId) || path.includes("/explanation"),
    },
    {
      href: ROUTES.studyBlankStudy(materialId),
      label: "빈칸 암기",
      icon: Layers,
      match: (path: string) => path.includes("/blank-study"),
    },
  ] as const

  return (
    <nav
      className="flex shrink-0 gap-10 border-b border-border/80 bg-background px-8"
      aria-label="학습 기능 탭"
    >
      {tabs.map((tab) => {
        const isActive = tab.match(pathname)

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative -mb-px flex items-center gap-2 py-3.5 text-[15px] transition-colors",
              isActive
                ? "font-semibold text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-full after:bg-primary"
                : "font-medium text-muted-foreground hover:text-foreground/75"
            )}
          >
            {"generateIcon" in tab && tab.generateIcon ? (
              <ExplanationGenerateIcon
                size={18}
                className="size-[18px] text-inherit"
                strokeWidth={isActive ? 2.25 : 1.75}
              />
            ) : (
              "icon" in tab && (
                <tab.icon
                  className={cn(
                    "size-[18px] shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground/90"
                  )}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
              )
            )}
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
