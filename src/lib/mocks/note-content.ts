import type { UserFile } from "@/types/user-file"
import type {
  NoteGenerateOptions,
  LectureNote,
} from "@/types/note"

const isTreeUserFile = (name: string) =>
  /트리|tree|bst|이진/i.test(name)

const isOsUserFile = (name: string) =>
  /운영체제|os|프로세스|스케줄/i.test(name)

const toTopicTitle = (name: string) =>
  name.replace(/\.pdf$/i, "").replace(/^.*[\\/]/, "").trim()

export const buildMockNote = (
  userFile: UserFile,
  options: NoteGenerateOptions
): Omit<LectureNote, "userFileId" | "generatedAt"> => {
  if (isTreeUserFile(userFile.name)) {
    return buildTreeNote(userFile, options)
  }

  if (isOsUserFile(userFile.name)) {
    return buildOsNote(userFile, options)
  }

  return buildGenericNote(userFile, options)
}

const buildTreeNote = (
  userFile: UserFile,
  options: NoteGenerateOptions
): Omit<LectureNote, "userFileId" | "generatedAt"> => {
  const title = toTopicTitle(userFile.name).includes("트리")
    ? "트리와 이진탐색트리"
    : toTopicTitle(userFile.name)

  return {
    options,
    title,
    estimatedMinutes: 8,
    accuracyPercent: 91,
    learningGoals: [
      "트리란 무엇인지, 왜 '계층 구조'로 데이터를 저장하는지",
      "이진탐색트리(BST)의 정렬 규칙 — 왼쪽 < 나 < 오른쪽",
      "왜 평균적으로 O(log n) 탐색이 가능한지",
      "균형이 깨지면 왜 O(n)까지 느려지는지",
    ],
    coreConcepts: [
      {
        id: "c1",
        title: "트리는 '계층'을 담는 그릇이다",
        body: "파일 탐색기를 떠올려 보세요. 폴더 안에 폴더, 그 안에 파일이 있는 것처럼 트리는 데이터를 계층적으로 저장합니다. 루트에서 시작해 부모·자식 관계로 내려가며, 사이클 없이 연결된 구조가 핵심입니다.",
        sourcePage: 12,
      },
      {
        id: "c2",
        title: "BST의 핵심은 단 한 줄의 규칙",
        body: "모든 노드에서 왼쪽 서브트리 키 < 현재 키 < 오른쪽 서브트리 키. 이 규칙 하나 덕분에 '작으면 왼쪽, 크면 오른쪽'으로 범위를 절반씩 줄여 가며 탐색할 수 있고, 균형이 유지되면 O(log n)이 됩니다.",
        sourcePage: 13,
      },
    ],
    examples: [
      {
        id: "ex1",
        title: "비유로 이해하기 — 사전 찾기",
        body: "사전에서 'M'으로 시작하는 단어를 찾을 때, 앞부분/뒷부분으로 범위를 좁혀 가듯 BST도 비교 결과에 따라 왼쪽·오른쪽으로 내려갑니다. 정렬된 데이터를 inorder로 읽으면 오름차순이 됩니다.",
        sourcePage: 15,
      },
    ],
    examHighlights: [
      {
        id: "e1",
        title: "N개 노드 트리의 간선 수 = N-1",
        hint: "증명·빈칸으로 자주 출제",
        sourcePage: 12,
      },
      {
        id: "e2",
        title: "BST 평균 O(log n), 최악 O(n)인 이유",
        hint: "서술형 단골",
        sourcePage: 13,
      },
      {
        id: "e3",
        title: "편향 트리가 생기는 입력 조건(정렬된 입력)",
        hint: "함정 보기로 출제",
        sourcePage: 13,
      },
    ],
    confusionPoints: [
      {
        id: "x1",
        category: "개념쌍",
        comparison: "깊이 vs 높이",
        body: "깊이는 '루트에서 나까지', 높이는 '나에서 가장 먼 리프까지'. 루트의 깊이는 0, 리프의 높이는 0.",
      },
      {
        id: "x2",
        category: "정의차이",
        comparison: "이진 트리 vs 이진 탐색 트리",
        body: "이진 트리는 자식이 최대 2개라는 뜻일 뿐. 정렬 규칙(왼<나<오)이 더해져야 비로소 '탐색' 트리다.",
      },
      {
        id: "x3",
        category: "조건",
        comparison: "O(log n) vs O(n)",
        body: "균형이 맞을 때만 log n. 정렬된 입력 → 한쪽 쏠림 → 사실상 리스트 → O(n).",
      },
    ],
    selfCheckQuestions: [
      "리프 노드의 정의를 한 문장으로 말해보세요.",
      "O/X — 모든 이진 트리는 이진 탐색 트리이다.",
      "노드 7개짜리 균형 BST의 높이는?",
      "정렬된 데이터를 그대로 삽입하면 BST는 어떤 모양이 되나요?",
    ],
    cheatSheet: {
      formulas: [
        "간선 수 = N - 1",
        "균형 BST 높이 ≈ ⌊log₂ N⌋",
        "탐색/삽입/삭제 평균 = O(log n)",
      ],
      rows: [
        { label: "이진 트리", middle: "자식 ≤ 2", right: "정렬규칙 없음" },
        { label: "BST", middle: "자식 ≤ 2", right: "왼 < 나 < 오" },
        { label: "균형 BST", middle: "자식 ≤ 2", right: "높이 log n 보장" },
      ],
    },
  }
}

const buildOsNote = (
  userFile: UserFile,
  options: NoteGenerateOptions
): Omit<LectureNote, "userFileId" | "generatedAt"> => {
  const title = toTopicTitle(userFile.name)

  return {
    options,
    title,
    estimatedMinutes: 10,
    accuracyPercent: 88,
    learningGoals: [
      "프로세스와 스레드의 차이",
      "CPU 스케줄링 알고리즘(FCFS, SJF, RR) 특징",
      "문맥 교환 비용이 성능에 미치는 영향",
    ],
    coreConcepts: [
      {
        id: "c1",
        title: "프로세스는 '실행 중인 프로그램'",
        body: "PCB에 상태·레지스터·메모리 맵이 저장됩니다. OS는 이 PCB를 보고 CPU를 할당하고 전환합니다.",
        sourcePage: 3,
      },
      {
        id: "c2",
        title: "스레드는 프로세스 안의 실행 흐름",
        body: "같은 프로세스 스레드는 힙·코드는 공유하고, 스택과 PC는 따로 둡니다. 생성·전환 비용이 프로세스보다 작습니다.",
        sourcePage: 4,
      },
    ],
    examples: [
      {
        id: "ex1",
        title: "Round Robin 비유",
        body: "교실에서 발언권을 2분씩 돌려주면 모두 CPU를 쓰지만, 자리 바꾸는(문맥 교환) 시간이 생깁니다.",
        sourcePage: 9,
      },
    ],
    examHighlights: [
      {
        id: "e1",
        title: "FCFS / SJF / RR 비교표 작성",
        hint: "starvation·convoy effect 포함",
        sourcePage: 9,
      },
    ],
    confusionPoints: [
      {
        id: "x1",
        category: "개념쌍",
        comparison: "프로세스 vs 스레드",
        body: "공유 범위(메모리)와 생성·전환 비용이 다릅니다.",
      },
    ],
    selfCheckQuestions: [
      "선점형과 비선점형 스케줄링의 차이는?",
      "문맥 교환이 왜 비용이 드는지 설명하세요.",
    ],
    cheatSheet: {
      formulas: ["RR: time quantum q", "선점형 = CPU 강제 회수 가능"],
      rows: [
        { label: "FCFS", middle: "비선점", right: "convoy effect" },
        { label: "SJF", middle: "선점/비선점", right: "starvation 가능" },
        { label: "RR", middle: "선점", right: "q에 따라 성능 변화" },
      ],
    },
  }
}

const buildGenericNote = (
  userFile: UserFile,
  options: NoteGenerateOptions
): Omit<LectureNote, "userFileId" | "generatedAt"> => {
  const title = toTopicTitle(userFile.name)

  return {
    options,
    title,
    estimatedMinutes: 7,
    accuracyPercent: 85,
    learningGoals: [
      `${title} PDF의 전체 구조와 핵심 용어 파악`,
      "정의 → 예시 → 시험 포인트 순으로 복습",
      "헷갈리는 개념쌍을 표로 정리",
    ],
    coreConcepts: [
      {
        id: "c1",
        title: "PDF 1장 — 범위와 기본 정의",
        body: `「${title}」의 학습 범위 전체를 먼저 훑고, 각 장의 역할(도입·본론·정리)을 파악하세요.`,
        sourcePage: 1,
      },
      {
        id: "c2",
        title: "PDF 2~3장 — 개념 간 관계",
        body: "원인→결과, 정의→예시 순으로 연결해 보면 서술형 답안 작성에 도움이 됩니다.",
        sourcePage: 3,
      },
    ],
    examples: [
      {
        id: "ex1",
        title: "개념 적용 연습",
        body: "교재 예제를 다른 숫자·상황에 대입해 보면 변형 문제에 대응하기 쉽습니다.",
        sourcePage: 4,
      },
    ],
    examHighlights: [
      {
        id: "e1",
        title: "정의 암기 + 간단 계산/그림 문제",
        hint: "기출 스타일 확인",
        sourcePage: 5,
      },
      {
        id: "e2",
        title: "교수님 강조 키워드(밑줄·별표)",
        hint: "short answer 대비",
        sourcePage: 6,
      },
    ],
    confusionPoints: [
      {
        id: "x1",
        category: "정리 팁",
        comparison: "비슷한 용어 A vs B",
        body: "차이점 한 줄 + 예시 한 줄로 표를 만들어 두세요.",
      },
    ],
    selfCheckQuestions: [
      "이 PDF의 핵심 주제를 한 문장으로 말해보세요.",
      "시험에 나올 만한 정의 3가지를 써 보세요.",
    ],
    cheatSheet: {
      formulas: ["시험 전날: 핵심 5개 + 헷갈림 3개만 재확인"],
      rows: [
        { label: "정의", middle: "암기", right: "예시 1개 연결" },
        { label: "비교", middle: "표 정리", right: "함정 보기 주의" },
      ],
    },
  }
}
