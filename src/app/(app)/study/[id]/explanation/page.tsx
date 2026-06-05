import { redirect } from "next/navigation"

import { ROUTES } from "@/constants/routes"

type StudyExplanationPageProps = {
  params: Promise<{ id: string }>
}

export default async function StudyExplanationPage({
  params,
}: StudyExplanationPageProps) {
  const { id } = await params
  redirect(ROUTES.study(id))
}
