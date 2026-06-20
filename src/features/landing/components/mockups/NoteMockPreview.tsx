import { CheckCircle2, Clock3 } from "lucide-react"

import { NoteGenerateIcon } from "@/features/note/components/NoteGenerateIcon"
import type { LectureNote } from "@/types/note"

type NoteMockPreviewProps = {
  data: LectureNote
}

export const NoteMockPreview = ({ data }: NoteMockPreviewProps) => {
  const difficultyLabel =
    data.options?.difficulty === "detailed" ? "자세히 설명" : "쉽게 설명"

  return (
    <div className="space-y-5 text-body-sm leading-relaxed text-foreground/90">
      <header className="space-y-2.5">
        <p className="flex items-center gap-1.5 font-medium text-primary">
          <NoteGenerateIcon
            size={16}
            className="size-4 text-inherit"
            strokeWidth={2}
          />
          AI 강의 노트 · {difficultyLabel}
        </p>
        <h3 className="text-lg font-bold tracking-tight text-foreground">
          {data.title}
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-caption text-muted-foreground">
            <Clock3 className="size-3.5" aria-hidden />
            예상 {data.estimatedMinutes}분
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-caption font-medium text-primary">
            <CheckCircle2 className="size-3.5" aria-hidden />
            정확도 {data.accuracyPercent}%
          </span>
        </div>
      </header>

      {data.learningGoals.length > 0 ? (
        <section className="space-y-2.5">
          <h4 className="text-body font-semibold text-foreground">
            오늘 배울 것
          </h4>
          <ol className="space-y-1.5">
            {data.learningGoals.slice(0, 3).map((goal, index) => (
              <li key={goal} className="flex gap-2 text-body-sm">
                <span className="shrink-0 font-semibold text-primary">
                  {index + 1}.
                </span>
                <span className="line-clamp-2 text-foreground/85">{goal}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {data.coreConcepts[0] ? (
        <section className="space-y-2 rounded-xl border border-border/60 bg-landing-panel/40 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-foreground">
              {data.coreConcepts[0].title}
            </h4>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-caption font-medium text-primary">
              p.{data.coreConcepts[0].sourcePage}
            </span>
          </div>
          <p className="line-clamp-3 text-body-sm leading-relaxed text-foreground/80">
            {data.coreConcepts[0].body}
          </p>
        </section>
      ) : null}
    </div>
  )
}
