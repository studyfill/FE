import { DashboardShell } from "@/components/layout/DashboardShell"
import { DashboardLibraryPage } from "@/features/dashboard/components/DashboardLibraryPage"
import { getServerSession } from "@/features/auth/actions"

export default async function DashboardPage() {
  const session = await getServerSession()

  return (
    <DashboardShell folderId={null} userName={session?.name}>
      <DashboardLibraryPage userName={session?.name} />
    </DashboardShell>
  )
}
