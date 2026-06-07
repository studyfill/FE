import { buildBlanksFromPdfText } from "@/lib/blank-study/build-blanks-from-pdf-text"
import type { Material } from "@/types/material"
import type { LectureExplanation } from "@/types/explanation"
import type { MaterialPdfPage } from "@/types/pdf-text"
import type {
  BlankGenerateOptions,
  BlankItem,
  BlankPageProse,
  BlankStudySession,
} from "@/types/blank-study"
import { BLANK_DENSITY_COUNTS } from "@/types/blank-study"

type BlankSeed = {
  sectionLabel?: string
  sourcePage?: number
  sentenceBefore: string
  sentenceAfter: string
  answer: string
  hint: string
}

const toItem = (
  materialId: string,
  seed: BlankSeed,
  index: number
): BlankItem => ({
  id: `${materialId}-blank-${index}`,
  materialId,
  sectionLabel: seed.sectionLabel,
  sourcePage: seed.sourcePage,
  sentenceBefore: seed.sentenceBefore,
  sentenceAfter: seed.sentenceAfter,
  answer: seed.answer,
  hint: seed.hint,
  status: "pending",
})

const sliceByDensity = (
  seeds: BlankSeed[],
  density: BlankGenerateOptions["density"]
): BlankSeed[] => seeds.slice(0, BLANK_DENSITY_COUNTS[density])

const explanationToSeeds = (explanation: LectureExplanation): BlankSeed[] => {
  const seeds: BlankSeed[] = []

  explanation.learningGoals.forEach((goal) => {
    const match = goal.match(/^(.{8,}?)([A-Za-z가-힣0-9()O]+)(.{4,})$/)
    if (match) {
      seeds.push({
        sectionLabel: "오늘 배울 것",
        sentenceBefore: match[1],
        sentenceAfter: match[3],
        answer: match[2],
        hint: "강의 노트 학습 목표에서 핵심어를 확인하세요.",
      })
    }
  })

  explanation.coreConcepts.forEach((concept) => {
    seeds.push({
      sectionLabel: "핵심 개념",
      sourcePage: concept.sourcePage,
      sentenceBefore: `${concept.title}: `,
      sentenceAfter: " (강의 노트)",
      answer: concept.title.split(" ")[0] ?? concept.title,
      hint: concept.body.slice(0, 60) + "…",
    })
    const bodyMatch = concept.body.match(
      /^(.{10,}?)([A-Za-z0-9()O]+(?:\([^)]*\))?)(.{5,})$/
    )
    if (bodyMatch) {
      seeds.push({
        sectionLabel: "핵심 개념",
        sourcePage: concept.sourcePage,
        sentenceBefore: bodyMatch[1],
        sentenceAfter: bodyMatch[3],
        answer: bodyMatch[2],
        hint: concept.title,
      })
    }
  })

  explanation.examHighlights.forEach((item) => {
    seeds.push({
      sectionLabel: "시험 핵심",
      sourcePage: item.sourcePage,
      sentenceBefore: "시험 핵심: ",
      sentenceAfter: ` (${item.hint})`,
      answer: item.title.split("=")[0]?.trim() ?? item.title,
      hint: item.hint,
    })
  })

  explanation.cheatSheet.formulas.forEach((formula) => {
    const parts = formula.split("=")
    if (parts.length === 2) {
      seeds.push({
        sectionLabel: "치트시트",
        sentenceBefore: parts[0].trim() + " = ",
        sentenceAfter: "",
        answer: parts[1].trim(),
        hint: "시험 직전 치트시트 공식",
      })
    }
  })

  if (seeds.length === 0) {
    seeds.push({
      sectionLabel: "강의 노트",
      sentenceBefore: "주제 ",
      sentenceAfter: " 를 복습하세요.",
      answer: explanation.title,
      hint: explanation.title,
    })
  }

  return seeds
}

export const buildMockBlankSession = (
  material: Material,
  options: BlankGenerateOptions,
  explanation: LectureExplanation | null,
  pdfPages?: MaterialPdfPage[]
): Omit<BlankStudySession, "materialId" | "generatedAt"> => {
  if (options.source === "explanation") {
    if (!explanation) {
      throw new Error(
        "강의 노트가 없습니다. 쉽게 설명 탭에서 먼저 생성해 주세요."
      )
    }
    const seeds = sliceByDensity(explanationToSeeds(explanation), options.density)
    const items = seeds.map((seed, index) => toItem(material.id, seed, index))
    return { options, items }
  }

  if (!pdfPages?.length) {
    throw new Error("PDF 원문 텍스트를 불러오지 못했습니다.")
  }

  const proseDrafts = buildBlanksFromPdfText(
    pdfPages,
    options.range,
    material.currentPage,
    options.density
  )

  const items: BlankItem[] = []
  const pdfProsePages: BlankPageProse[] = []
  let blankIndex = 0

  proseDrafts.forEach((page) => {
    const nodes: BlankPageProse["nodes"] = []

    page.nodes.forEach((node) => {
      if (node.type === "text") {
        nodes.push(node)
        return
      }

      const item = toItem(material.id, node.seed, blankIndex)
      blankIndex += 1
      items.push(item)
      nodes.push({ type: "blank", itemId: item.id })
    })

    if (nodes.length > 0) {
      pdfProsePages.push({ pageNumber: page.pageNumber, nodes })
    }
  })

  return { options, items, pdfPages: pdfProsePages }
}
