"use client"

import {
  CheckCircle2,
  CircleHelp,
  Clock3,
  Eye,
  Lightbulb,
  PencilLine,
  Star,
} from "lucide-react"

import { EditableText } from "@/features/explanation/components/EditableText"
import { ExplanationGenerateIcon } from "@/features/explanation/components/ExplanationGenerateIcon"
import { TextFormatToolbar } from "@/features/explanation/components/TextFormatToolbar"
import { ExplanationEditProvider } from "@/features/explanation/context/ExplanationEditContext"
import type { LectureExplanation } from "@/types/explanation"

type ExplanationResultViewProps = {
  data: LectureExplanation
  onSourceClick: (page: number) => void
}

const PageLink = ({
  page,
  onSourceClick,
}: {
  page: number
  onSourceClick: (page: number) => void
}) => (
  <button
    type="button"
    onClick={() => onSourceClick(page)}
    className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/15"
    aria-label={`${page}페이지로 이동`}
  >
    <span aria-hidden>≡</span>
    p.{page}
  </button>
)

const SectionHeader = ({
  index,
  title,
  icon,
}: {
  index: number
  title: string
  icon?: React.ReactNode
}) => (
  <div className="flex items-center gap-2.5 border-b border-border pb-2.5">
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
      {index}
    </span>
    <h3 className="flex items-center gap-1.5 text-body font-semibold text-foreground">
      {icon}
      {title}
    </h3>
  </div>
)

const EditHint = () => (
  <p className="flex items-center gap-1.5 rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
    <PencilLine className="size-3.5 shrink-0" />
    텍스트를 드래그해 선택하면 굵게·기울임·하이라이트·색깔펜·밑줄을 적용할 수 있어요.
  </p>
)

const ExplanationDocument = ({
  data,
  onSourceClick,
}: ExplanationResultViewProps) => {
  const difficultyLabel =
    data.options?.difficulty === "detailed" ? "자세히 설명" : "쉽게 설명"

  let sectionIndex = 0
  const nextSection = () => {
    sectionIndex += 1
    return sectionIndex
  }

  return (
    <>
      <TextFormatToolbar />
      <article className="flex flex-col gap-8 text-sm leading-relaxed text-foreground/90">
        <header className="space-y-3">
          <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
            <ExplanationGenerateIcon
              size={16}
              className="size-4 text-inherit"
              strokeWidth={2}
            />
            AI 강의 노트 · {difficultyLabel}
          </p>
          <EditableText
            fieldKey="title"
            defaultText={data.title}
            className="text-xl font-bold tracking-tight text-foreground"
          />
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
              <Clock3 className="size-3.5" />
              예상 {data.estimatedMinutes}분
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
              <CheckCircle2 className="size-3.5" />
              정확도 {data.accuracyPercent}%
            </span>
          </div>
        </header>

        <EditHint />

        {data.learningGoals.length > 0 ? (
          <section className="space-y-4">
            <SectionHeader index={nextSection()} title="오늘 배울 것" />
            <ol className="space-y-2.5 pl-1">
              {data.learningGoals.map((goal, index) => (
                <li key={goal} className="flex gap-2.5">
                  <span className="shrink-0 font-semibold text-primary">
                    {index + 1}.
                  </span>
                  <EditableText
                    fieldKey={`learningGoals.${index}`}
                    defaultText={goal}
                    className="flex-1"
                  />
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {data.coreConcepts.length > 0 ? (
          <section className="space-y-5">
            <SectionHeader index={nextSection()} title="핵심 개념" />
            <div className="space-y-6">
              {data.coreConcepts.map((concept) => (
                <div key={concept.id} className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <EditableText
                      fieldKey={`coreConcepts.${concept.id}.title`}
                      defaultText={concept.title}
                      className="font-semibold text-foreground"
                    />
                    <PageLink
                      page={concept.sourcePage}
                      onSourceClick={onSourceClick}
                    />
                  </div>
                  <EditableText
                    fieldKey={`coreConcepts.${concept.id}.body`}
                    defaultText={concept.body}
                    className="leading-[1.7] text-foreground/85"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {data.examples.length > 0 ? (
          <section className="space-y-4">
            <SectionHeader index={nextSection()} title="예시로 이해하기" />
            {data.examples.map((example) => (
              <div
                key={example.id}
                className="space-y-2 rounded-lg bg-primary/[0.05] px-4 py-3.5"
              >
                <div className="flex items-start gap-2 font-semibold text-foreground">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
                  <EditableText
                    fieldKey={`examples.${example.id}.title`}
                    defaultText={example.title}
                    className="flex-1"
                  />
                </div>
                <EditableText
                  fieldKey={`examples.${example.id}.body`}
                  defaultText={example.body}
                  className="leading-[1.7] pl-6 text-foreground/85"
                />
                <div className="pl-6">
                  <PageLink
                    page={example.sourcePage}
                    onSourceClick={onSourceClick}
                  />
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {data.examHighlights.length > 0 ? (
          <section className="space-y-4">
            <SectionHeader
              index={nextSection()}
              title="시험에 나올 핵심"
              icon={<Star className="size-4 text-primary" />}
            />
            <ol className="space-y-4">
              {data.examHighlights.map((item, index) => (
                <li
                  key={item.id}
                  className="border-l-[0.1875rem] border-primary/50 pl-3.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="font-semibold text-foreground">
                      <span className="mr-1.5 text-primary">{index + 1}.</span>
                      <EditableText
                        fieldKey={`examHighlights.${item.id}.title`}
                        defaultText={item.title}
                        className="inline"
                      />
                    </div>
                    <PageLink
                      page={item.sourcePage}
                      onSourceClick={onSourceClick}
                    />
                  </div>
                  <EditableText
                    fieldKey={`examHighlights.${item.id}.hint`}
                    defaultText={item.hint}
                    className="mt-1 text-xs text-muted-foreground"
                  />
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {data.confusionPoints.length > 0 ? (
          <section className="space-y-4">
            <SectionHeader
              index={nextSection()}
              title="헷갈리는 부분"
              icon={<Eye className="size-4 text-muted-foreground" />}
            />
            <ul className="space-y-5">
              {data.confusionPoints.map((item) => (
                <li key={item.id} className="space-y-1.5">
                  <EditableText
                    fieldKey={`confusionPoints.${item.id}.category`}
                    defaultText={item.category}
                    className="text-xs font-medium text-muted-foreground"
                  />
                  <EditableText
                    fieldKey={`confusionPoints.${item.id}.comparison`}
                    defaultText={item.comparison}
                    className="font-semibold text-foreground"
                  />
                  <EditableText
                    fieldKey={`confusionPoints.${item.id}.body`}
                    defaultText={item.body}
                    className="leading-[1.7] text-foreground/85"
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {data.selfCheckQuestions.length > 0 ? (
          <section className="space-y-4">
            <SectionHeader
              index={nextSection()}
              title="스스로 점검하기"
              icon={<CircleHelp className="size-4 text-muted-foreground" />}
            />
            <ol className="divide-y divide-border">
              {data.selfCheckQuestions.map((question, index) => (
                <li
                  key={question}
                  className="flex gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                  <EditableText
                    fieldKey={`selfCheckQuestions.${index}`}
                    defaultText={question}
                    className="flex-1 pt-0.5 leading-[1.65]"
                  />
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {data.cheatSheet.formulas.length > 0 ||
        data.cheatSheet.rows.length > 0 ? (
          <section className="space-y-3">
            <SectionHeader index={nextSection()} title="시험 직전 치트시트" />
            <div className="rounded-xl bg-[#1e2a24] px-4 py-4 text-[#e8f0eb]">
              {data.cheatSheet.formulas.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#8fb89a]">
                    핵심 공식 · 정의
                  </p>
                  <ul className="space-y-1.5 text-sm">
                    {data.cheatSheet.formulas.map((formula, index) => (
                      <li key={formula}>
                        <EditableText
                          fieldKey={`cheatSheet.formulas.${index}`}
                          defaultText={formula}
                          variant="dark"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {data.cheatSheet.rows.length > 0 ? (
                <div
                  className={
                    data.cheatSheet.formulas.length > 0
                      ? "mt-4 space-y-2 border-t border-white/10 pt-4"
                      : "space-y-2"
                  }
                >
                  <p className="text-xs font-medium text-[#8fb89a]">비교표</p>
                  <div className="space-y-2 text-sm">
                    {data.cheatSheet.rows.map((row, index) => (
                      <div
                        key={row.label}
                        className="grid grid-cols-[88px_1fr_1fr] gap-x-3 gap-y-1 border-b border-white/10 pb-2 last:border-0 last:pb-0"
                      >
                        <EditableText
                          fieldKey={`cheatSheet.rows.${index}.label`}
                          defaultText={row.label}
                          variant="dark"
                          className="font-medium text-[#8fb89a]"
                        />
                        <EditableText
                          fieldKey={`cheatSheet.rows.${index}.middle`}
                          defaultText={row.middle}
                          variant="dark"
                          className="text-[#c5d5ca]"
                        />
                        <EditableText
                          fieldKey={`cheatSheet.rows.${index}.right`}
                          defaultText={row.right}
                          variant="dark"
                          className="text-[#c5d5ca]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </article>
    </>
  )
}

export const ExplanationResultView = ({
  data,
  onSourceClick,
}: ExplanationResultViewProps) => (
  <ExplanationEditProvider
    materialId={data.materialId}
    generatedAt={data.generatedAt}
  >
    <ExplanationDocument data={data} onSourceClick={onSourceClick} />
  </ExplanationEditProvider>
)
