import { MaterialsPageContent } from "@/features/materials/components/MaterialsPageContent"

type MaterialsFolderPageProps = {
  params: Promise<{ folderId: string }>
}

export default async function MaterialsFolderPage({
  params,
}: MaterialsFolderPageProps) {
  const { folderId } = await params
  return <MaterialsPageContent folderId={folderId} />
}
