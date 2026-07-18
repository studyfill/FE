"use client"

import { Loader2, Sparkles } from "lucide-react"

import { GenerateErrorAlert } from "@/components/common/GenerateErrorAlert"
import { SegmentedOptionGroup } from "@/components/common/SegmentedOptionGroup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NoteGenerateIcon } from "@/features/note/components/NoteGenerateIcon"
import { NoteResultView } from "@/features/note/components/NoteResultView"
import type { useNote } from "@/features/note/hooks/useNote"
import { useStudyWorkspace } from "@/features/study/context/StudyWorkspaceContext"
import type { UserFile } from "@/types/user-file"

type NoteGeneratePanelProps = {
  userFile: UserFile
  note: ReturnType<typeof useNote>
}

export const NoteGeneratePanel = ({
  userFile,
  note,
}: NoteGeneratePanelProps) => {
  const { setPage, setHighlightPage } = useStudyWorkspace()
  const {
    note: data,
    options,
    setOptions,
    isGenerating,
    error,
    handleGenerate,
  } = note

  const handleSourceClick = (page: number) => {
    setHighlightPage(page)
    setPage(page)
  }

  const handleGenerateClick = () => {
    void handleGenerate()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!data ? (
        <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 pt-4 pb-28">
          <div className="flex w-full max-w-generate-panel -translate-y-4 flex-col gap-8">
            <div className="space-y-3 text-center">
              <NoteGenerateIcon
                size={52}
                className="mx-auto size-icon-xl text-primary"
                strokeWidth={1.75}
              />
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                강의식 설명 생성
              </h2>
              <p className="text-body leading-[1.65] text-muted-foreground">
                &apos;요약&apos;이 아니라 강의 노트처럼 풀어서 설명해 드려요.
                <br />
                시험 핵심·헷갈리는 부분·치트시트까지 함께 만듭니다.
              </p>
            </div>

            <div className="flex w-full flex-col gap-5">
              <div className="space-y-2.5">
                <SegmentedOptionGroup
                  label="범위"
                  columns={2}
                  value={options.range}
                  onChange={(range) =>
                    setOptions((prev) => ({
                      ...prev,
                      range,
                      ...(range === "all"
                        ? { pageStart: null, pageEnd: null }
                        : {}),
                    }))
                  }
                  options={[
                    { value: "all", label: "전체" },
                    { value: "page", label: "페이지 지정" },
                  ]}
                />
                {options.range === "page" ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      placeholder="시작"
                      aria-label="시작 페이지"
                      value={options.pageStart ?? ""}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          pageStart:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        }))
                      }
                    />
                    <span className="text-muted-foreground">~</span>
                    <Input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      placeholder="끝"
                      aria-label="끝 페이지"
                      value={options.pageEnd ?? ""}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          pageEnd:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                ) : null}
              </div>
              <SegmentedOptionGroup
                label="난이도"
                columns={2}
                value={options.difficulty}
                onChange={(difficulty) =>
                  setOptions((prev) => ({ ...prev, difficulty }))
                }
                options={[
                  { value: "summary", label: "정리", sublabel: "내용 정리" },
                  {
                    value: "explanation",
                    label: "설명",
                    sublabel: "내용 정리 + 추가 설명",
                  },
                ]}
              />
            </div>

            <div className="space-y-3">
            <Button
              type="button"
              className="h-12 w-full rounded-button text-body font-semibold"
              onClick={handleGenerateClick}
              disabled={isGenerating || userFile.extractionStatus !== "done"}
              aria-label="설명 생성하기"
            >
              {isGenerating ? (
                <Loader2 className="size-icon-md animate-spin" />
              ) : (
                <Sparkles className="size-icon-md" strokeWidth={2} />
              )}
              {isGenerating ? "생성 중…" : "설명 생성하기"}
            </Button>

              {userFile.extractionStatus !== "done" ? (
                <p className="text-center text-sm text-muted-foreground">
                  텍스트 추출 완료 후 이용할 수 있습니다.
                </p>
              ) : null}

              {error ? (
                <GenerateErrorAlert
                  onRetry={handleGenerateClick}
                  isRetrying={isGenerating}
                />
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <div className="px-6 py-8">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
              <NoteResultView
                data={data}
                onSourceClick={handleSourceClick}
              />

              <p className="text-center text-xs text-muted-foreground">
                {new Date(data.generatedAt).toLocaleString("ko-KR")} 생성
              </p>

              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-button"
                onClick={handleGenerateClick}
                disabled={isGenerating || userFile.extractionStatus !== "done"}
              >
                {isGenerating ? (
                  <Loader2 className="size-icon-md animate-spin" />
                ) : (
                  <Sparkles className="size-icon-md" strokeWidth={2} />
                )}
                {isGenerating ? "재생성 중…" : "다시 생성하기"}
              </Button>

              {error ? (
                <GenerateErrorAlert
                  onRetry={handleGenerateClick}
                  isRetrying={isGenerating}
                />
              ) : null}
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
