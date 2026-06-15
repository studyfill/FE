# Landing (도메인 가이드 — Phase A)

비로그인 진입 페이지: 기능 소개 / 사용법 / 가격. **구현된 기능만 홍보**(정직성 규칙).
(Cursor용 동일 규칙: `.cursor/rules/features/landing.mdc` — 함께 갱신)

## 홍보 가능 (구현됨)

- 폴더별 PDF/이미지 보관·정리, 파일명 검색, 3종 정렬(최근 열람/생성일/폴더)
- AI 강의식 설명(온디맨드), 빈칸 암기(클릭 모드·즉시 채점·세션 내 오답 재풀이)
- 하이라이트·밑줄 노트 편집(설명 탭), Google 로그인 + 게스트 체험

## 홍보 금지 (Phase B/C 또는 미구현)

- 본문 통합 검색, 간격 반복(SRS), 3단계 자신감 평가, 오답 자동 재출제, 오답노트 폴더
- 퀴즈, AI 튜터("준비 중" 표기 없을 때), 팀 공유, 학습 패턴 분석, 월 사용 한도 강제

## CTA

- **로그인** → `AuthDialog` (Google OAuth)
- **무료로 시작하기** → 게스트 모드 (`useEnterGuestMode`)

## 핵심 파일

- `src/features/landing/constants/landing-content.ts` — 카피 단일 진실 소스
- `components/LandingPage.tsx`
