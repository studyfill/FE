"use client"

import { use } from "react"

import { ExplanationPanel } from "@/features/explanation/components/ExplanationPanel"
import { useExplanation } from "@/features/explanation/hooks/useExplanation"
import { useMaterial } from "@/features/pdf/hooks/useMaterial"

type StudyExplanationPageProps = {
  params: Promise<{ id: string }>
}

export default function StudyExplanationPage({
  params,
}: StudyExplanationPageProps) {
  const { id } = use(params)
  const { material } = useMaterial(id)
  const explanation = useExplanation(id)

  if (!material) return null

  return <ExplanationPanel material={material} explanation={explanation} />
}
