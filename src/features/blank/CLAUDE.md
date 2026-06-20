# Blank (빈칸 학습 — 도메인 가이드)

백엔드 `blank` 도메인과 정렬됨(FE feature 폴더 `blank`, 라우트 `/study/[id]/blank`).
공통 학습 탭 패턴은 `src/features/study/CLAUDE.md`. 대규모 작업은 `.claude/skills/blank-study/SKILL.md`.

## 핵심 원칙

빈칸 학습은 **플래시카드/카드 UI 아님**. 연속 텍스트 흐름 속 인라인 빈칸 입력(워크북식 active recall):

```txt
N개 노드 트리의 간선 수는 ______ 이다. BST에서 왼쪽 자식은 현재 키보다 ______ 값을 가진다.
```

- 번호 목록(`1.` `2.`)으로 렌더하지 말 것. 섹션 라벨로 묶되 문장은 단일 `<p>`에 흐르게.
- **온디맨드**: 업로드가 아니라 사용자가 생성 클릭 시에만 빈칸 생성.

## 생성 옵션 (`BlankGeneratePanel`)

| 옵션 | 값 | 비고 |
|------|----|------|
| 출처 | `pdf` \| `note` | PDF 원문 vs 생성된 강의 노트(쉽게 설명) |
| 범위 | `all` \| `chapter` \| `page` | **PDF 출처일 때만** 표시 |
| 밀도 | `light` \| `normal` \| `dense` | mock item 수 |

**출처 규칙**:
- `pdf`: 저장된 PDF 추출 텍스트(`UserFilePdfText`)에서 원문 문장에 빈칸 — 수작업 seed 아님
- `note`: `LectureNote`(핵심 개념/시험 강조 등)에서 추출
- `note` 선택 + 설명 없음 → **생성 차단** + 쉽게 설명 탭 CTA (자동 폴백 금지)

## 결과 UI (`BlankResultView`)

- progress bar, 인라인 빈칸 연속 prose, 힌트/피드백, 오답 재시도, **[저장]**(하이브리드 편집 확정)
- 카드 래퍼·번호 목록 없음
- **힌트**: hover/focus 시 표시(클릭 토글 아님), 문장형 맥락 힌트
- **채점**: `normalizeAnswer` — trim·lowercase·특수문자 제거·대소문자 무시 정확 일치
- **하이브리드 저장**: AI 생성 → 사용자 클릭-투-블랭크 편집 → [저장]으로 세션 persist(`saveBlankSession`)

## 핵심 파일

- 컴포넌트: `BlankGeneratePanel`, `BlankResultView`, `BlankProseSection`, `BlankPdfProseView`, `BlankSelectableText`
- 훅: `hooks/useBlank.ts` / 타입: `src/types/blank.ts`
- 로직: `src/lib/blank/` (build, tokenize, add/remove custom blank, normalize-answer)
- mock: `src/lib/mocks/blank.ts`, `blank-content.ts` / 라우트: `src/app/(app)/study/[id]/blank/page.tsx`
