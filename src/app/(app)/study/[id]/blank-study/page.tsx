"use client"

import { use } from "react"

import { BlankStudyPanel } from "@/features/blank-study/components/BlankStudyPanel"
import { useBlankStudy } from "@/features/blank-study/hooks/useBlankStudy"
import { useMaterial } from "@/features/pdf/hooks/useMaterial"
import { ScrollArea } from "@/components/ui/scroll-area"

type StudyBlankStudyPageProps = {
  params: Promise<{ id: string }>
}

export default function StudyBlankStudyPage({
  params,
}: StudyBlankStudyPageProps) {
  const { id } = use(params)
  const { material } = useMaterial(id)
  const blankStudy = useBlankStudy(id)

  if (!material) return null

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="px-4 py-6">
        <BlankStudyPanel material={material} blankStudy={blankStudy} />
      </div>
    </ScrollArea>
  )
}
