"use client"

import type { ReactNode } from "react"

import { Separator } from "@/components/ui/separator"

type StudySplitLayoutProps = {
  left: ReactNode
  right: ReactNode
}

export const StudySplitLayout = ({ left, right }: StudySplitLayoutProps) => {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <section
        className="flex min-h-0 min-w-0 flex-[1.15] flex-col border-r border-border"
        aria-label="PDF 뷰어"
      >
        {left}
      </section>
      <Separator orientation="vertical" className="hidden" />
      <section
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        aria-label="학습 기능"
      >
        {right}
      </section>
    </div>
  )
}
