"use client"

import { use } from "react"

import { BlankGeneratePanel } from "@/features/blank/components/BlankGeneratePanel"
import { useBlank } from "@/features/blank/hooks/useBlank"
import { useUserFile } from "@/features/pdf/hooks/useUserFile"

type StudyBlankPageProps = {
  params: Promise<{ id: string }>
}

export default function StudyBlankPage({
  params,
}: StudyBlankPageProps) {
  const { id } = use(params)
  const { userFile } = useUserFile(id)
  const blank = useBlank(id)

  if (!userFile) return null

  return <BlankGeneratePanel userFile={userFile} blank={blank} />
}
