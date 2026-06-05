"use client"

import { Loader2, Sparkles } from "lucide-react"

import { SegmentedOptionGroup } from "@/components/common/SegmentedOptionGroup"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { useExplanation } from "@/features/explanation/hooks/useExplanation"
import { useStudyWorkspace } from "@/features/study/context/StudyWorkspaceContext"
import type { ExplanationPoint } from "@/types/explanation"
import type { Material } from "@/types/material"

type ExplanationGeneratePanelProps = {
  material: Material
  explanation: ReturnType<typeof useExplanation>
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

export const ExplanationGeneratePanel = ({
  material,
  explanation,
}: ExplanationGeneratePanelProps) => {
  const { setPage, setHighlightPage } = useStudyWorkspace()
  const {
    explanation: data,
    options,
    setOptions,
    isGenerating,
    error,
    handleGenerate,
  } = explanation

  const handleSourceClick = (page: number) => {
    setHighlightPage(page)
    setPage(page)
  }

  const handleGenerateClick = () => {
    void handleGenerate()
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex flex-col gap-6 px-4 py-6">
        {!data ? (
          <>
            <div className="space-y-2 text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-5" />
              </div>
              <h2 className="text-base font-semibold">강의식 설명 생성</h2>
              <p className="text-sm text-muted-foreground">
                단순 요약이 아닌, 강의 노트처럼 차근차근 풀어 쓴 설명을
                만들어 드립니다.
              </p>
            </div>

            <div className="space-y-5">
              <SegmentedOptionGroup
                label="범위"
                value={options.range}
                onChange={(range) => setOptions((prev) => ({ ...prev, range }))}
                options={[
                  { value: "all", label: "전체" },
                  { value: "chapter", label: "현재 챕터" },
                  { value: "page", label: "현재 페이지" },
                ]}
              />
              <SegmentedOptionGroup
                label="형태"
                value={options.format}
                onChange={(format) => setOptions((prev) => ({ ...prev, format }))}
                options={[
                  { value: "lecture-notes", label: "강의 노트" },
                  { value: "bullet-points", label: "글머리 핵심" },
                  { value: "exam-prep", label: "시험 대비" },
                ]}
              />
              <SegmentedOptionGroup
                label="난이도"
                value={options.difficulty}
                onChange={(difficulty) =>
                  setOptions((prev) => ({ ...prev, difficulty }))
                }
                options={[
                  {
                    value: "easy",
                    label: "쉽게",
                    description: "비유 중심",
                  },
                  {
                    value: "detailed",
                    label: "자세히",
                    description: "정의 중심",
                  },
                ]}
              />
            </div>

            <Button
              type="button"
              className="w-full"
              onClick={handleGenerateClick}
              disabled={isGenerating || material.extractionStatus !== "done"}
              aria-label="설명 생성하기"
            >
              {isGenerating ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Sparkles />
              )}
              {isGenerating ? "생성 중…" : "설명 생성하기"}
            </Button>

            {material.extractionStatus !== "done" ? (
              <p className="text-center text-xs text-muted-foreground">
                텍스트 추출 완료 후 이용할 수 있습니다.
              </p>
            ) : null}
          </>
        ) : (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-base font-semibold">설명 결과</h2>
              <p className="text-xs text-muted-foreground">
                {new Date(data.generatedAt).toLocaleString("ko-KR")} 생성
              </p>
            </div>

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

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGenerateClick}
              disabled={isGenerating || material.extractionStatus !== "done"}
            >
              {isGenerating ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Sparkles />
              )}
              {isGenerating ? "재생성 중…" : "다시 생성하기"}
            </Button>
          </div>
        )}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </ScrollArea>
  )
}
