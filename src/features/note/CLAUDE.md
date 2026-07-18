# Note (쉽게 설명 — 도메인 가이드)

"쉽게 설명" 탭 — AI 강의식 설명 노트(핵심 개념·시험 강조)를 온디맨드 생성하고, 하이라이트/밑줄로 편집.
백엔드 `note` 도메인과 정렬됨(FE feature 폴더 `note`, 라우트 `/study/[id]/note`).
공통 학습 탭 패턴은 `src/features/study/CLAUDE.md`.

## 동작

- 온디맨드 생성: 업로드 시 생성 안 함. `NoteGeneratePanel`에서 생성 클릭 시 콘텐츠 생성.
- **백엔드 연동(BFF)**: 생성은 비동기다. `POST /generate`(접수, noteId) → `GET /{noteId}/status`
  폴링(2초, 최대 ~2분) → 완료 시 `GET /{noteId}` 상세. 마운트 시 `GET (목록)`으로 기존 노트를
  로드하고 `GENERATING`이면 폴링을 재개한다. files 도메인과 동일하게 `src/app/api/files/[fileId]/notes/**`
  BFF 라우트 + `bffFetch`(클라 토큰 미노출). API 클라이언트는 `src/lib/api/notes.ts`.
- 결과: `NoteResultView` — 강의 노트형 prose(번호 나열식 지양, study-feature-tab 패턴 준수)
- 생성 실패: `GenerateErrorAlert` 인라인 재시도(raw 에러 미노출). 에러 코드 매핑은 `notes.ts` `noteErrorMessage`.

## 노트 편집 (하이라이트·밑줄)

- 인라인 편집: `EditableText`, 편집 상태는 `context/NoteEditContext.tsx`
- 서식 툴바: `TextFormatToolbar` + 펜 밑줄 스타일, 로직 `utils/text-format.ts`
- 편집 저장 훅: `hooks/useNoteEdits.ts`, 데이터 훅: `hooks/useNote.ts`

## 핵심 파일

- 컴포넌트: `NoteGeneratePanel`, `NoteResultView`, `EditableText`, `TextFormatToolbar`, `NoteGenerateIcon`
- 데이터 훅: `hooks/useNote.ts`(백엔드 연동) → API `src/lib/api/notes.ts` + BFF `src/app/api/files/[fileId]/notes/**`
- 타입: `src/types/note.ts`(`LectureNoteContent`=백엔드 content 계약, `LectureNote`=content+래퍼)
- mock: `note-content.ts`·`note.ts`는 이제 landing 프리뷰/`blank` 목업 전용. 편집 저장(`note-edits.ts`)은
  아직 localStorage(`useNoteEdits`) — 서버 `fieldEdits` 연동은 후속 작업(TODO).
- 라우트: `src/app/(app)/study/[id]/note/page.tsx`

## 연계

- 빈칸 학습의 `note` 출처는 이 탭의 생성 결과(`LectureNote`)에 의존
  → 설명 없으면 빈칸 생성 차단(`src/features/blank/CLAUDE.md`)
