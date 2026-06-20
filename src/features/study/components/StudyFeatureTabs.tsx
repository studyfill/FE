"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Layers } from "lucide-react"

import { NoteGenerateIcon } from "@/features/note/components/NoteGenerateIcon"
import { ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"

type StudyFeatureTabsProps = {
  userFileId: string
}

export const StudyFeatureTabs = ({ userFileId }: StudyFeatureTabsProps) => {
  const pathname = usePathname()

  const tabs = [
    {
      href: ROUTES.study(userFileId),
      label: "쉽게 설명",
      generateIcon: true,
      match: (path: string) =>
        path === ROUTES.study(userFileId) || path.includes("/note"),
    },
    {
      href: ROUTES.studyBlank(userFileId),
      label: "빈칸 암기",
      icon: Layers,
      match: (path: string) => path.includes("/blank"),
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
              "relative -mb-px flex items-center gap-2 py-3.5 text-body transition-colors",
              isActive
                ? "font-semibold text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.75 after:rounded-full after:bg-primary"
                : "font-medium text-muted-foreground hover:text-foreground/75"
            )}
          >
            {"generateIcon" in tab && tab.generateIcon ? (
              <NoteGenerateIcon
                size={18}
                className="size-icon-md text-inherit"
                strokeWidth={isActive ? 2.25 : 1.75}
              />
            ) : (
              "icon" in tab && (
                <tab.icon
                  className={cn(
                    "size-icon-md shrink-0",
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
