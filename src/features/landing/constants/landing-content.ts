export const LANDING_NAV_LINKS = [
  { href: "#features", label: "기능" },
  { href: "#how-to", label: "이용 방법" },
  { href: "#pricing", label: "요금제" },
] as const

export const LANDING_UNIVERSITY_TAGS = [
  "서울대",
  "연세대",
  "고려대",
  "카이스트",
  "성균관대",
  "한양대",
] as const

export const LANDING_FEATURES = [
  {
    id: "library",
    label: "자료 보관",
    title: "공부 자료, 이제 여기 다 모으세요",
    description:
      "교재, 강의 슬라이드, 논문까지 — PDF라면 뭐든 올려서 폴더로 정리하세요. 검색 한 번으로 바로 찾고, 언제든 이어서 공부할 수 있어요.",
    bullets: [
      "과목별 폴더로 정리·보관",
      "파일명 검색",
      "최근 열람순·생성일순·폴더순 정렬",
      "PDF·이미지(JPG, PNG) 업로드",
    ],
  },
  {
    id: "note",
    label: "AI 노트 편집",
    title: "교수님보다 잘 설명해 드려요",
    description:
      "딱딱한 원문을 정리만 하는 게 아니라, 강의하듯 풀어 설명해요. 비유·예시·시험 포인트까지 한 화면에.",
    bullets: [
      "비유·예시 중심의 쉬운 설명",
      "근거 문단(출처) 함께 제공",
      "시험에 자주 나오는 포인트 자동 추출",
      "헷갈리는 개념 비교·정리",
      "시험 직전 요약 치트시트 자동 생성",
    ],
  },
  {
    id: "blank",
    label: "빈칸 암기",
    title: "외울 때까지 빈칸이 닫히지 않아요",
    description:
      "핵심 용어를 빈칸으로 바꾸고, 답을 입력하면 즉시 채점해요. 클릭으로 직접 빈칸을 만들거나 AI가 추출해 줘요.",
    bullets: [
      "PDF·AI 노트에서 빈칸 자동 추출",
      "클릭으로 직접 빈칸 만들기",
      "직접 답 입력·즉시 채점",
      "호버 힌트로 문맥 이해",
      "세션 내 오답 다시 풀기",
    ],
  },
] as const

export const LANDING_HOW_TO_STEPS = [
  {
    step: "01",
    title: "PDF 보관",
    description:
      "교재, 강의 자료, 논문 어디서나 — 폴더로 정리해 영구 보관하세요.",
    iconColor: "text-primary",
    iconBg: "bg-primary/15",
  },
  {
    step: "02",
    title: "AI 노트 생성 + 직접 편집",
    description:
      "AI가 설명해주고, 하이라이트·색깔펜으로 나만의 노트로 완성해요.",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-400/15",
  },
  {
    step: "03",
    title: "빈칸으로 확실하게",
    description:
      "원문에서 빈칸을 뚫고 채우며 외워요. 직접 만들거나 AI가 추출해요.",
    iconColor: "text-sky-400",
    iconBg: "bg-sky-400/15",
  },
] as const

export type LandingTestimonial = {
  id: string
  quote: string
  highlight: string
  name: string
  role: string
  avatarColor: string
  initial: string
}

export const LANDING_TESTIMONIALS: LandingTestimonial[] = [
  {
    id: "1",
    quote:
      "강의 녹음 대신 PDF만 올려도 설명이 나와서 진짜 수업 듣는 것 같아요. 시험 전날 치트시트가 특히 좋아요.",
    highlight: "진짜 수업 듣는 것 같아요",
    name: "이서연",
    role: "행정학과 시험 준비 · 3학년",
    avatarColor: "bg-sky-500",
    initial: "이",
  },
  {
    id: "2",
    quote:
      "빈칸 암기가 플래시카드랑 달라요. 문장 흐름 안에서 외우니까 훨씬 오래 남아요.",
    highlight: "훨씬 오래 남아요",
    name: "박지훈",
    role: "의대 2학년",
    avatarColor: "bg-emerald-500",
    initial: "박",
  },
  {
    id: "3",
    quote:
      "폴더 정리랑 검색이 깔끔해서 자료 찾는 시간이 줄었어요. 다 알아서 해줘서 공부에만 집중할 수 있어요.",
    highlight: "다 알아서 해줘서",
    name: "최유진",
    role: "대학원생 · 공학",
    avatarColor: "bg-rose-500",
    initial: "최",
  },
  {
    id: "4",
    quote:
      "처음엔 AI 설명이 반신반의였는데, 출처 링크가 있어서 원문 확인하면서 보니까 생각보다 훨씬 잘 돼요.",
    highlight: "생각보다 훨씬 잘 돼요",
    name: "김도윤",
    role: "컴퓨터공학 4학년",
    avatarColor: "bg-violet-500",
    initial: "김",
  },
]

export type LandingPricingPlan = {
  id: string
  name: string
  monthlyPrice: string
  yearlyPrice: string
  description: string
  features: { text: string; included: boolean }[]
  cta: string
  variant: "outline" | "primary" | "dark"
  popular?: boolean
}

export const LANDING_PRICING_PLANS: LandingPricingPlan[] = [
  {
    id: "free",
    name: "무료",
    monthlyPrice: "무료",
    yearlyPrice: "무료",
    description: "부담 없이 써보세요. 기간 제한 없이 무료예요.",
    features: [
      { text: "PDF·이미지 업로드", included: true },
      { text: "AI 설명 생성", included: true },
      { text: "빈칸 암기", included: true },
      { text: "폴더 관리", included: true },
      { text: "퀴즈 생성 (준비 중)", included: false },
      { text: "AI 튜터 (준비 중)", included: false },
    ],
    cta: "무료로 시작",
    variant: "outline",
  },
  {
    id: "pro",
    name: "PRO",
    monthlyPrice: "9,900 원 / 월",
    yearlyPrice: "7,920 원 / 월",
    description: "시험을 제대로 준비하는 학생을 위한 플랜이에요.",
    features: [
      { text: "PDF·이미지 무제한", included: true },
      { text: "설명 무제한", included: true },
      { text: "빈칸 무제한", included: true },
      { text: "폴더 관리·태그", included: true },
      { text: "퀴즈 생성 (준비 중)", included: false },
      { text: "AI 튜터 (준비 중)", included: false },
    ],
    cta: "Pro 시작하기",
    variant: "primary",
    popular: true,
  },
  {
    id: "max",
    name: "MAX",
    monthlyPrice: "19,900 원 / 월",
    yearlyPrice: "15,920 원 / 월",
    description: "심화 학습 기능이 추가되면 가장 먼저 이용할 수 있어요.",
    features: [
      { text: "Pro의 모든 기능", included: true },
      { text: "AI 튜터 (준비 중)", included: false },
      { text: "퀴즈·오답노트 (준비 중)", included: false },
      { text: "우선 지원", included: true },
      { text: "신기능 얼리 액세스", included: true },
      { text: "향후 확장 기능 우선 제공", included: true },
    ],
    cta: "Max 시작하기",
    variant: "dark",
  },
]

export const LANDING_FOOTER_LINKS = {
  product: [
    { label: "쉽게 설명", href: "#features" },
    { label: "빈칸 암기", href: "#features" },
    { label: "퀴즈 (준비 중)", href: "#features" },
    { label: "요금제", href: "#pricing" },
  ],
  company: [
    { label: "소개", href: "#" },
    { label: "블로그", href: "#" },
    { label: "채용", href: "#" },
    { label: "문의", href: "#" },
  ],
  legal: [
    { label: "이용약관", href: "#" },
    { label: "개인정보처리방침", href: "#" },
    { label: "환불 정책", href: "#" },
  ],
} as const
