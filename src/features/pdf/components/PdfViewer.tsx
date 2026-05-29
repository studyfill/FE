"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Material } from "@/types/material"

type PdfViewerProps = {
  material: Material
  onPageChange: (page: number) => void
  highlightPage?: number | null
}

export const PdfViewer = ({
  material,
  onPageChange,
  highlightPage,
}: PdfViewerProps) => {
  const page = highlightPage ?? material.currentPage
  const total = material.pageCount || 1

  const handlePrev = () => onPageChange(page - 1)
  const handleNext = () => onPageChange(page + 1)

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">PDF 뷰어</CardTitle>
        <CardDescription>
          {material.extractionStatus === "done"
            ? "페이지를 이동하며 원문을 확인합니다."
            : "텍스트 추출이 완료되면 뷰어를 사용할 수 있습니다."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div
          className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-12 text-center"
          aria-label={`PDF 페이지 ${page} 미리보기`}
        >
          <p className="text-sm font-medium">{material.name}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {page} / {total}
          </p>
          <p className="mt-2 max-w-sm text-xs text-muted-foreground">
            MVP mock 뷰어입니다. 실제 PDF 렌더링은 추후 연동됩니다.
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={page <= 1}
            aria-label="이전 페이지"
          >
            <ChevronLeft />
            이전
          </Button>
          <span className="text-sm text-muted-foreground">
            페이지 {page}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={page >= total}
            aria-label="다음 페이지"
          >
            다음
            <ChevronRight />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
