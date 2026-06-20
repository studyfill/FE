"use client"

import { use } from "react"

import { NoteGeneratePanel } from "@/features/note/components/NoteGeneratePanel"
import { useNote } from "@/features/note/hooks/useNote"
import { useUserFile } from "@/features/pdf/hooks/useUserFile"

type StudyPageProps = {
  params: Promise<{ id: string }>
}

export default function StudyPage({ params }: StudyPageProps) {
  const { id } = use(params)
  const { userFile } = useUserFile(id)
  const note = useNote(id)

  if (!userFile) return null

  return (
    <NoteGeneratePanel userFile={userFile} note={note} />
  )
}
