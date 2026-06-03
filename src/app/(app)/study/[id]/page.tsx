"use client"

import { Suspense, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

import { PdfViewer } from "@/features/pdf/components/PdfViewer"
import { useMaterial } from "@/features/pdf/hooks/useMaterial"

type StudyPdfPageProps = {
  params: Promise<{ id: string }>
}

const StudyPdfPageInner = ({ id }: { id: string }) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { material, setPage } = useMaterial(id)

  useEffect(() => {
    const pageParam = searchParams.get("page")
    if (pageParam && material) {
      const page = Number(pageParam)
      if (!Number.isNaN(page) && page >= 1) {
        setPage(page)
        router.replace(`/study/${id}`)
      }
    }
  }, [searchParams, material, id, setPage, router])

  if (!material) return null

  return <PdfViewer material={material} onPageChange={setPage} />
}

export default function StudyPdfPage({ params }: StudyPdfPageProps) {
  const { id } = use(params)

  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">PDF 뷰어 로딩 중…</p>
      }
    >
      <StudyPdfPageInner id={id} />
    </Suspense>
  )
}
