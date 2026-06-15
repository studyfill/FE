# Dashboard (도메인 가이드 — Phase A)

내 라이브러리: 폴더 트리, 정렬, 업로드, 파일명 검색. 전역 규칙은 루트 `CLAUDE.md`.
(Cursor용 동일 규칙: `.cursor/rules/features/dashboard.mdc` — 함께 갱신)

## 폴더

- 무제한 depth 트리 (백엔드 연동 시 Adjacency List 모델)
- 폴더/자료 DnD 이동 (`@dnd-kit`, `LibraryDndProvider`)
- 최근 폴더 strip (최근 방문 10개)
- **leaf 폴더에만 업로드** (자식 있는 폴더는 업로드 차단)

## 정렬 (3종)

| value | 라벨 | 로직 |
|-------|------|------|
| `recent` | 최근 열람순 | `lastStudiedAt` desc, null 마지막 |
| `created` | 생성일순 | `uploadedAt` desc |
| `folder` | 폴더순 | 폴더명 → 날짜 |

`lastStudiedAt`은 학습 워크스페이스 진입(`StudyShell` mount) 시 갱신.

## 업로드 (Phase A)

- 형식: PDF, JPG, PNG / 최대 50MB / PDF 최대 100p (TRD)
- 이미지: 단일 페이지 뷰어 (OCR은 Phase C)
- 백엔드 연동 시 multipart 업로드는 `src/lib/api/upload.ts`의 `uploadFile` 사용

## 검색

- Phase A는 **파일명만**. 본문 통합 검색은 Phase B.

## 핵심 파일

- `components/LibraryToolbar.tsx`, `hooks/useDashboardLibrary.ts`, `context/DashboardLibraryContext.tsx`
- `components/FileUploadDialog.tsx`
- mock: `src/lib/mocks/materials.ts`, `src/lib/mocks/folders.ts` / 상수: `src/constants/upload.ts`
