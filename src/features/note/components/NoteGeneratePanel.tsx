"use client"

import { Loader2, Sparkles } from "lucide-react"

import { GenerateErrorAlert } from "@/components/common/GenerateErrorAlert"
import { SegmentedOptionGroup } from "@/components/common/SegmentedOptionGroup"
import { Button } from "@/components/ui/button"
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
              <SegmentedOptionGroup
                label="형태"
                value={options.format}
                onChange={(format) =>
                  setOptions((prev) => ({ ...prev, format }))
                }
                options={[
                  { value: "lecture-notes", label: "강의 노트" },
                  { value: "bullet-points", label: "글머리 핵심" },
                  { value: "exam-prep", label: "시험 대비" },
                ]}
              />
              <SegmentedOptionGroup
                label="난이도"
                columns={2}
                value={options.difficulty}
                onChange={(difficulty) =>
                  setOptions((prev) => ({ ...prev, difficulty }))
                }
                options={[
                  { value: "easy", label: "쉽게", sublabel: "비유 중심" },
                  { value: "detailed", label: "자세히", sublabel: "정의 중심" },
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
