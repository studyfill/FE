---
name: sync-api
description: 백엔드 OpenAPI 스펙에서 TypeScript 타입(src/lib/api/schema.d.ts)을 재생성하고 변경 영향을 확인한다. 백엔드 API/DTO가 바뀐 뒤, 또는 새 엔드포인트를 붙이기 전에 사용.
---

# /sync-api — 백엔드 API 타입 동기화

StudyFill 백엔드가 자동 생성하는 OpenAPI 스펙을 단일 진실 소스로 삼아 프론트 타입을 재생성한다.

## 언제 쓰나
- 백엔드가 API/DTO를 변경·머지한 뒤
- 새 엔드포인트를 연동하기 직전 (계약 먼저 확인)
- 타입 오류가 백엔드 변경 때문인지 확인할 때

## 절차

1. **백엔드 스펙 소스 결정**
   - 배포 백엔드(기본): `https://be-production-5944.up.railway.app/v3/api-docs`
   - 로컬 실행 중이면: `http://localhost:8080/v3/api-docs`
   - 커밋된 스펙 스냅샷이 있으면: `./openapi.json`

2. **타입 재생성** (이 레포는 pnpm 사용)
   ```bash
   pnpm gen:api:prod       # 배포 백엔드(Railway)에서 생성 — 가장 흔함
   pnpm gen:api            # 로컬 백엔드(http://localhost:8080)에서 생성
   pnpm gen:api:file       # ./openapi.json 스냅샷에서 생성
   ```
   `openapi-typescript`가 없으면 `pnpm i -D openapi-typescript` 안내.
   생성물 `src/lib/api/schema.d.ts`는 **커밋한다**(러닝 백엔드 없이 타입 사용 가능). 편의 별칭은 `src/lib/api/types.ts`.

3. **변경 영향 확인**
   ```bash
   git diff --stat src/lib/api/schema.d.ts
   pnpm dlx tsc --noEmit    # 타입이 바뀐 호출부에서 컴파일 에러가 나는지
   ```

4. **에러 코드 동기화 점검**
   - 백엔드 `ERROR_CODE.md`에 새 코드가 추가됐다면 `src/lib/api/errors.ts`의 `ErrorCode` 상수에도 반영.

5. **요약 보고**
   - 추가/변경/삭제된 엔드포인트·타입, 컴파일 에러가 난 파일과 수정 방향을 간단히 정리.
   - 깨진 호출부는 `apiFetch` 시그니처를 유지한 채 새 타입에 맞춰 수정한다(직접 fetch로 우회 금지).

## 주의
- `schema.d.ts`는 생성물이므로 **직접 수정 금지**. 항상 재생성으로 갱신.
- 백엔드 응답은 `{ success, data, code, message }` 래퍼다. 타입은 보통 `data` payload 기준이므로
  `apiFetch<T>`의 `T`에 payload 타입을 넣는다(래퍼는 client.ts가 처리).
