"use client"

import Link from "next/link"
import { FileText, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ROUTES } from "@/constants/routes"
import type { Material } from "@/types/material"

type MaterialListProps = {
  materials: Material[]
}

const statusLabel: Record<Material["extractionStatus"], string> = {
  pending: "대기",
  processing: "텍스트 추출 중",
  done: "준비 완료",
  failed: "추출 실패",
}

export const MaterialList = ({ materials }: MaterialListProps) => {
  if (materials.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          업로드된 PDF가 없습니다. PDF를 업로드해 학습을 시작하세요.
        </CardContent>
      </Card>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {materials.map((material) => (
        <li key={material.id}>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
              <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1 space-y-1">
                <CardTitle className="truncate text-base">{material.name}</CardTitle>
                <CardDescription>
                  {new Date(material.uploadedAt).toLocaleDateString("ko-KR")} ·{" "}
                  {statusLabel[material.extractionStatus]}
                  {material.extractionStatus === "processing" ? (
                    <Loader2 className="ml-1 inline size-3 animate-spin" />
                  ) : null}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-2 pt-0">
              <span className="text-xs text-muted-foreground">
                진도 {material.progressPercent}%
                {material.pageCount > 0 ? ` · ${material.pageCount}페이지` : ""}
              </span>
              {material.extractionStatus === "done" ? (
                <Link href={ROUTES.study(material.id)}>
                  <Button
                    type="button"
                    size="sm"
                    aria-label={`${material.name} 학습하기`}
                  >
                    학습하기
                  </Button>
                </Link>
              ) : (
                <Button type="button" size="sm" disabled>
                  학습하기
                </Button>
              )}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  )
}
