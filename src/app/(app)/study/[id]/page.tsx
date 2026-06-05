"use client"

import { use } from "react"

import { ExplanationGeneratePanel } from "@/features/explanation/components/ExplanationGeneratePanel"
import { useExplanation } from "@/features/explanation/hooks/useExplanation"
import { useMaterial } from "@/features/pdf/hooks/useMaterial"

type StudyPageProps = {
  params: Promise<{ id: string }>
}

export default function StudyPage({ params }: StudyPageProps) {
  const { id } = use(params)
  const { material } = useMaterial(id)
  const explanation = useExplanation(id)

  if (!material) return null

  return (
    <ExplanationGeneratePanel material={material} explanation={explanation} />
  )
}
