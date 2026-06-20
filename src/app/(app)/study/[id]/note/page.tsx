import { redirect } from "next/navigation"

import { ROUTES } from "@/constants/routes"

type StudyNotePageProps = {
  params: Promise<{ id: string }>
}

export default async function StudyNotePage({
  params,
}: StudyNotePageProps) {
  const { id } = await params
  redirect(ROUTES.study(id))
}
