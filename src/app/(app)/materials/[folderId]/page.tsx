import { redirect } from "next/navigation"

import { ROUTES } from "@/constants/routes"

type MaterialsFolderRedirectProps = {
  params: Promise<{ folderId: string }>
}

export default async function MaterialsFolderRedirectPage({
  params,
}: MaterialsFolderRedirectProps) {
  const { folderId } = await params
  redirect(ROUTES.libraryFolder(folderId))
}
