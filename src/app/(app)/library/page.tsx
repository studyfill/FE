import { LibraryShell } from "@/components/layout/LibraryShell"
import { LibraryPage } from "@/features/library/components/LibraryPage"
import { getServerSession } from "@/features/auth/session"

export default async function LibraryRoutePage() {
  const session = await getServerSession()

  return (
    <LibraryShell folderId={null} userName={session?.name}>
      <LibraryPage userName={session?.name} />
    </LibraryShell>
  )
}
