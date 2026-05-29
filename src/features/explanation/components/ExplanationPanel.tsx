"use client"

import { Loader2, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ROUTES } from "@/constants/routes"
import type { ExplanationPoint } from "@/types/explanation"
import type { Material } from "@/types/material"

type ExplanationPanelProps = {
  material: Material
  explanation: ReturnType<
    typeof import("@/features/explanation/hooks/useExplanation").useExplanation
  >
}

const PointList = ({
  title,
  points,
  onSourceClick,
}: {
  title: string
  points: ExplanationPoint[]
  onSourceClick: (page: number) => void
}) => (
  <section className="space-y-2">
    <h3 className="text-sm font-semibold">{title}</h3>
    <ul className="flex flex-col gap-2">
      {points.map((point) => (
        <li
          key={point.id}
          className="rounded-md border border-border bg-muted/20 px-3 py-2 text-sm"
        >
          <p>{point.text}</p>
          <button
            type="button"
            className="mt-1 text-xs text-primary hover:underline"
            onClick={() => onSourceClick(point.sourcePage)}
            aria-label={`${point.sourcePage}페이지로 이동`}
          >
            출처: p.{point.sourcePage}
          </button>
        </li>
      ))}
    </ul>
  </section>
)

export const ExplanationPanel = ({
  material,
  explanation,
}: ExplanationPanelProps) => {
  const router = useRouter()
  const {
    explanation: data,
    isGenerating,
    error,
    handleGenerate,
    setHighlightPage,
  } = explanation

  const handleSourceClick = (page: number) => {
    setHighlightPage(page)
    router.push(`${ROUTES.study(material.id)}?page=${page}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">강의식 설명</CardTitle>
          <CardDescription>
            버튼을 눌렀을 때만 AI가 강의 노트 형태의 설명을 생성합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={
              isGenerating || material.extractionStatus !== "done"
            }
            aria-label="설명 생성"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Sparkles />
            )}
            {isGenerating ? "생성 중…" : "설명 생성"}
          </Button>
          {material.extractionStatus !== "done" ? (
            <p className="mt-2 text-xs text-muted-foreground">
              텍스트 추출 완료 후 이용할 수 있습니다.
            </p>
          ) : null}
          {error ? (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {data ? (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">설명 결과</CardTitle>
            <CardDescription>
              {new Date(data.generatedAt).toLocaleString("ko-KR")} 생성
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <PointList
              title="핵심 개념"
              points={data.coreConcepts}
              onSourceClick={handleSourceClick}
            />
            <PointList
              title="시험 핵심 포인트"
              points={data.examHighlights}
              onSourceClick={handleSourceClick}
            />
            <PointList
              title="헷갈리는 부분"
              points={data.confusionPoints}
              onSourceClick={handleSourceClick}
            />
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">
          아직 생성된 설명이 없습니다. 설명 생성 버튼을 눌러 주세요.
        </p>
      )}
    </div>
  )
}
