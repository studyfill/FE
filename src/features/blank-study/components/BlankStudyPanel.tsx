"use client"

import { Lightbulb, Loader2, RotateCcw } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { Material } from "@/types/material"

import type { useBlankStudy } from "@/features/blank-study/hooks/useBlankStudy"

type BlankStudyPanelProps = {
  material: Material
  blankStudy: ReturnType<typeof useBlankStudy>
}

export const BlankStudyPanel = ({ material, blankStudy }: BlankStudyPanelProps) => {
  const {
    items,
    answers,
    isGenerating,
    error,
    completedCount,
    progressPercent,
    handleGenerate,
    handleSubmit,
    handleRetryIncorrect,
    setAnswer,
  } = blankStudy

  const hasIncorrect = items.some((i) => i.status === "incorrect")
  const [hintVisible, setHintVisible] = useState<Record<string, boolean>>({})

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">빈칸 암기</CardTitle>
          <CardDescription>
            워크북형 인라인 빈칸으로 암기합니다. 버튼을 눌렀을 때만
            빈칸 문장이 생성됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={
              isGenerating || material.extractionStatus !== "done"
            }
            aria-label="빈칸 만들기"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" />
            ) : null}
            {isGenerating ? "생성 중…" : "빈칸 만들기"}
          </Button>
          {items.length > 0 ? (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  진행 {completedCount}/{items.length}
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : null}
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          빈칸 문장이 없습니다. 빈칸 만들기를 눌러 주세요.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item, index) => (
            <li key={item.id}>
              <Card className="shadow-sm">
                <CardContent className="space-y-3 pt-4">
                  <p className="text-sm leading-relaxed">
                    <span className="text-muted-foreground">
                      {index + 1}.{" "}
                    </span>
                    {item.sentenceBefore}
                    <span className="mx-1 inline-block min-w-24 align-middle">
                      {item.status !== "pending" ? (
                        <span
                          className={
                            item.status === "correct"
                              ? "font-medium text-primary"
                              : "font-medium text-destructive"
                          }
                        >
                          {answers[item.id] || "—"}
                        </span>
                      ) : (
                        <Input
                          className="inline-flex h-7 max-w-40 px-2 text-sm"
                          value={answers[item.id] ?? ""}
                          onChange={(e) =>
                            setAnswer(item.id, e.target.value)
                          }
                          aria-label={`빈칸 ${index + 1} 답 입력`}
                          disabled={item.status !== "pending"}
                        />
                      )}
                    </span>
                    {item.sentenceAfter}
                  </p>

                  {item.status === "pending" ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSubmit(item.id)}
                        disabled={!answers[item.id]?.trim()}
                      >
                        확인
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        aria-label="힌트 보기"
                        onClick={() =>
                          setHintVisible((prev) => ({
                            ...prev,
                            [item.id]: true,
                          }))
                        }
                      >
                        <Lightbulb />
                        힌트
                      </Button>
                    </div>
                  ) : null}

                  {hintVisible[item.id] && item.status === "pending" ? (
                    <p className="text-xs text-muted-foreground">{item.hint}</p>
                  ) : null}

                  {item.status === "incorrect" ? (
                    <p className="text-sm text-destructive" role="status">
                      오답입니다. 정답: <strong>{item.answer}</strong>
                    </p>
                  ) : null}

                  {item.status === "correct" ? (
                    <p className="text-sm text-primary" role="status">
                      정답입니다.
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {hasIncorrect ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleRetryIncorrect}
          aria-label="오답 다시 풀기"
        >
          <RotateCcw />
          오답 다시 풀기
        </Button>
      ) : null}
    </div>
  )
}
