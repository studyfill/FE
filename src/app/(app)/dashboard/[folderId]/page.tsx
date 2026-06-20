import { redirect } from "next/navigation"

import { ROUTES } from "@/constants/routes"

type DashboardFolderRedirectProps = {
  params: Promise<{ folderId: string }>
}

export default async function DashboardFolderRedirectPage({
  params,
}: DashboardFolderRedirectProps) {
  const { folderId } = await params
  redirect(ROUTES.libraryFolder(folderId))
}
