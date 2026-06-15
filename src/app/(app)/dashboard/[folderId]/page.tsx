import { DashboardShell } from "@/components/layout/DashboardShell"
import { DashboardLibraryPage } from "@/features/dashboard/components/DashboardLibraryPage"
import { getServerSession } from "@/features/auth/session"

type DashboardFolderPageProps = {
  params: Promise<{ folderId: string }>
}

export default async function DashboardFolderPage({
  params,
}: DashboardFolderPageProps) {
  const { folderId } = await params
  const session = await getServerSession()

  return (
    <DashboardShell folderId={folderId} userName={session?.name}>
      <DashboardLibraryPage userName={session?.name} />
    </DashboardShell>
  )
}
