# Study Feature Tab (공통 도메인 가이드)

학습 워크스페이스의 탭(설명/빈칸, Phase B 퀴즈 등)이 공유하는 셸 패턴.
explanation·blank-study도 이 패턴을 따른다.

## 레이아웃

- split-pane: PDF 좌측, 기능 패널 우측 — `components/StudySplitLayout.tsx`
- 셸: `StudyShell`, 탭: `StudyFeatureTabs`, 헤더: `StudyWorkspaceHeader`
- 페이지/하이라이트 동기화: `StudyWorkspaceContext` (`setPage`, `setHighlightPage`)
- 반응형: `>= lg` 또는 가로 태블릿은 split-pane, `< lg` 세로는 탭 전환(`StudyMobilePaneTabs`,
  `hooks/useStudyLayoutMode.ts`)

## Generate 패널 빈 상태

결과가 없을 때:

- `max-w-generate-panel` 중앙 컬럼, 기능 아이콘(`size-icon-xl`), 제목, 짧은 설명
- 생성 옵션은 `SegmentedOptionGroup`, 하단 primary CTA, 로딩은 버튼에 `Loader2`
- 이 패턴을 explanation·blank-study에서 동일하게 적용

## Generate 에러 (인라인 재시도)

- AI 생성 실패 시 `GenerateErrorAlert` 사용 — 고정 문구 "분석에 실패했습니다" + 재시도 버튼
- raw `err.message`를 UI에 노출하지 않는다

## 온디맨드 AI

- 업로드 시에는 PDF 텍스트 추출만 (설명/빈칸/퀴즈 생성 없음)
- 사용자가 생성 버튼을 눌러야 콘텐츠 생성. 백엔드 연동 시 생성은 비동기(jobId → status 폴링,
  `API_INTEGRATION.md` §6)

## 기능별 가이드

- 설명 탭: `src/features/explanation/CLAUDE.md`
- 빈칸 탭: `src/features/blank-study/CLAUDE.md`
