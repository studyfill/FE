"use client"

import { PageHeader } from "@/components/layout/PageHeader"
import { MaterialList } from "@/features/materials/components/MaterialList"
import { PdfUploadButton } from "@/features/materials/components/PdfUploadButton"
import { useMaterials } from "@/features/materials/hooks/useMaterials"
import { getRootFolderId } from "@/lib/mocks/mock-store"

type MaterialsPageContentProps = {
  folderId?: string
}

export const MaterialsPageContent = ({
  folderId = getRootFolderId(),
}: MaterialsPageContentProps) => {
  const { materials, isUploading, uploadError, handleUpload } =
    useMaterials(folderId)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="자료 관리"
        description="PDF를 업로드하고 폴더에서 학습 자료를 관리합니다. 업로드 직후에는 텍스트 추출만 진행됩니다."
        action={
          <PdfUploadButton onUpload={handleUpload} isUploading={isUploading} />
        }
      />
      {uploadError ? (
        <p className="text-sm text-destructive" role="alert">
          {uploadError}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        AI 설명·빈칸 생성은 학습 화면에서 버튼을 눌렀을 때만 실행됩니다.
      </p>
      <MaterialList materials={materials} />
    </div>
  )
}
