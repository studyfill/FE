import { LibraryShell } from "@/components/layout/LibraryShell"
import { LibraryPage } from "@/features/library/components/LibraryPage"
import { getServerSession } from "@/features/auth/session"

type LibraryFolderRoutePageProps = {
  params: Promise<{ folderId: string }>
}

export default async function LibraryFolderRoutePage({
  params,
}: LibraryFolderRoutePageProps) {
  const { folderId } = await params
  const session = await getServerSession()

  return (
    <LibraryShell folderId={folderId} userName={session?.name}>
      <LibraryPage userName={session?.name} />
    </LibraryShell>
  )
}
