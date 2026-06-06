"use client"

import Link from "next/link"
import { Layers, Loader2, Sparkles } from "lucide-react"

import { SegmentedOptionGroup } from "@/components/common/SegmentedOptionGroup"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ROUTES } from "@/constants/routes"
import { BlankStudyResultView } from "@/features/blank-study/components/BlankStudyResultView"
import type { useBlankStudy } from "@/features/blank-study/hooks/useBlankStudy"
import type { Material } from "@/types/material"

type BlankGeneratePanelProps = {
  material: Material
  blankStudy: ReturnType<typeof useBlankStudy>
}

export const BlankGeneratePanel = ({
  material,
  blankStudy,
}: BlankGeneratePanelProps) => {
  const {
    session,
    options,
    setOptions,
    hasExplanation,
    isGenerating,
    error,
    handleGenerate,
  } = blankStudy

  const isExplanationSource = options.source === "explanation"
  const needsExplanation = isExplanationSource && !hasExplanation
  const extractionReady = material.extractionStatus === "done"

  const handleGenerateClick = () => {
    void handleGenerate()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!session ? (
        <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 pt-4 pb-28">
          <div className="flex w-full max-w-generate-panel -translate-y-4 flex-col gap-8">
            <div className="space-y-3 text-center">
              <Layers
                className="mx-auto size-icon-xl text-primary"
                strokeWidth={1.75}
              />
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                빈칸 암기 생성
              </h2>
              <p className="text-body leading-[1.65] text-muted-foreground">
                PDF 원문 또는 강의 노트에서 핵심어를 빈칸으로 만들어
                <br />
                워크북처럼 바로 암기할 수 있어요.
              </p>
            </div>

            <div className="flex w-full flex-col gap-5">
              <SegmentedOptionGroup
                label="출처"
                columns={2}
                value={options.source}
                onChange={(source) =>
                  setOptions((prev) => ({ ...prev, source }))
                }
                options={[
                  { value: "pdf", label: "PDF 원문" },
                  { value: "explanation", label: "강의 노트" },
                ]}
              />

              {!isExplanationSource ? (
                <SegmentedOptionGroup
                  label="범위"
                  value={options.range}
                  onChange={(range) =>
                    setOptions((prev) => ({ ...prev, range }))
                  }
                  options={[
                    { value: "all", label: "전체" },
                    { value: "chapter", label: "현재 챕터" },
                    { value: "page", label: "현재 페이지" },
                  ]}
                />
              ) : null}

              <SegmentedOptionGroup
                label="빈칸 밀도"
                value={options.density}
                onChange={(density) =>
                  setOptions((prev) => ({ ...prev, density }))
                }
                options={[
                  { value: "light", label: "적게", sublabel: "5개" },
                  { value: "normal", label: "보통", sublabel: "10개" },
                  { value: "dense", label: "많이", sublabel: "15개" },
                ]}
              />
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                className="h-12 w-full rounded-button text-body font-semibold"
                onClick={handleGenerateClick}
                disabled={
                  isGenerating || !extractionReady || needsExplanation
                }
                aria-label="빈칸 생성하기"
              >
                {isGenerating ? (
                  <Loader2 className="size-icon-md animate-spin" />
                ) : (
                  <Sparkles className="size-icon-md" strokeWidth={2} />
                )}
                {isGenerating ? "생성 중…" : "빈칸 생성하기"}
              </Button>

              {!extractionReady ? (
                <p className="text-center text-sm text-muted-foreground">
                  텍스트 추출 완료 후 이용할 수 있습니다.
                </p>
              ) : null}

              {needsExplanation ? (
                <p className="text-center text-sm text-muted-foreground">
                  강의 노트가 없습니다.{" "}
                  <Link
                    href={ROUTES.study(material.id)}
                    className="font-medium text-primary underline-offset-2 hover:underline"
                  >
                    쉽게 설명
                  </Link>
                  탭에서 먼저 생성해 주세요.
                </p>
              ) : null}

              {error ? (
                <p className="text-center text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <div className="px-6 py-8">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
              <BlankStudyResultView
                session={session}
                blankStudy={blankStudy}
                onRegenerate={handleGenerateClick}
                isGenerating={isGenerating}
                extractionReady={extractionReady}
              />

              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
