"use client"

import Link from "next/link"
import { ArrowRight, FileText } from "lucide-react"
import { useEffect, useState } from "react"

import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ROUTES } from "@/constants/routes"
import { listMaterials } from "@/lib/mocks/materials"
import type { Material } from "@/types/material"

const formatDate = (iso: string | null) => {
  if (!iso) return "학습 기록 없음"
  return new Date(iso).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const DashboardContent = () => {
  const [materials, setMaterials] = useState<Material[]>([])

  useEffect(() => {
    setMaterials(listMaterials().slice(0, 5))
  }, [])

  const recent = materials[0]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="대시보드"
        description="학습 진도와 최근 자료를 한눈에 확인합니다."
        action={
          <Link href={ROUTES.materials}>
            <Button type="button" variant="outline" size="sm">
              자료 관리
            </Button>
          </Link>
        }
      />

      {recent ? (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">이어서 학습하기</CardTitle>
            <CardDescription>가장 최근에 다룬 자료입니다.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-medium">{recent.name}</p>
              <p className="text-sm text-muted-foreground">
                진도 {recent.progressPercent}% ·{" "}
                {formatDate(recent.lastStudiedAt)}
              </p>
            </div>
            <Link href={ROUTES.study(recent.id)}>
              <Button type="button" size="sm" aria-label="학습 이어하기">
                이어하기
                <ArrowRight />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">자료별 진도</h2>
        {materials.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              등록된 자료가 없습니다.{" "}
              <Link href={ROUTES.materials} className="text-primary hover:underline">
                PDF 업로드
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {materials.map((material) => (
              <li key={material.id}>
                <Card className="shadow-sm">
                  <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-sm">
                        {material.name}
                      </CardTitle>
                      <CardDescription>
                        {formatDate(material.lastStudiedAt)}
                      </CardDescription>
                    </div>
                    <span className="text-sm font-medium tabular-nums">
                      {material.progressPercent}%
                    </span>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${material.progressPercent}%` }}
                      />
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Link href={ROUTES.study(material.id)}>
                        <Button type="button" variant="ghost" size="sm">
                          학습 열기
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
