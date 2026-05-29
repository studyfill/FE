"use client"

import { use } from "react"

import { BlankStudyPanel } from "@/features/blank-study/components/BlankStudyPanel"
import { useBlankStudy } from "@/features/blank-study/hooks/useBlankStudy"
import { useMaterial } from "@/features/pdf/hooks/useMaterial"

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

  return <BlankStudyPanel material={material} blankStudy={blankStudy} />
}
