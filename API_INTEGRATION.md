# StudyFill — Frontend ↔ Backend Integration Guide

Next.js 프론트엔드가 StudyFill 백엔드와 연동하는 방법을 한 곳에 정리했습니다.
백엔드 `FRONTEND_INTEGRATION.md` / `API_SPEC.md` / `ERROR_CODE.md` / `ENV.md`를 프론트 관점으로 종합·확장한 문서입니다.

```
백엔드 컨트롤러 → springdoc → /v3/api-docs (openapi.json)
                                   ↓ openapi-typescript
                          src/lib/api/schema.d.ts (타입)
                                   ↓
        apiFetch(인증·언래핑·에러·401 자동 갱신) → React 컴포넌트/훅
```

---

## 1. OpenAPI 스펙 얻기 (계약의 원천)

백엔드 실행 중일 때:

| 용도 | URL |
|------|-----|
| 사람이 보는 문서 (Swagger UI) | `http://localhost:8080/swagger-ui.html` |
| 기계 판독용 스펙 (JSON) | `http://localhost:8080/v3/api-docs` |

```bash
curl http://localhost:8080/v3/api-docs -o openapi.json
```

타입 생성 (이 레포는 pnpm 사용):
```bash
pnpm i -D openapi-typescript
pnpm gen:api          # = openapi-typescript http://localhost:8080/v3/api-docs -o src/lib/api/schema.d.ts
# 또는 /sync-api 스킬 사용
```

---

## 2. 공통 응답 래퍼 — 반드시 언래핑

**모든** 응답은 아래 평면 구조로 감싸집니다.

```ts
type ApiResponse<T> = {
  success: boolean
  data: T | null
  code: string     // "COMMON_200", "FILE_001" ...
  message: string  // 사용자 표시용
}
```

목록 API는 `data` 안에 페이지 정보가 들어갑니다.

```ts
type Page<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}
```

→ `data`만 꺼내고 `success === false`면 `ApiError`로 던지는 **`apiFetch` 한 곳**으로만 호출합니다.
구현은 `src/lib/api/client.ts` 참고. 컴포넌트에서 직접 `fetch` 금지(훅이 경고).

---

## 3. 인증 (Google Authorization Code 방식)

백엔드는 **Authorization Code** 방식만 지원합니다. 프론트가 `code`를 받고, 교환은 서버가 합니다.

> 참고: 현재 FE 는 쿠키 기반 mock 세션(`src/features/auth/actions.ts`)을 사용 중입니다.
> 아래 토큰 플로우(`src/lib/api/auth.ts`)로의 전환은 후속 작업입니다.

### 로그인 시퀀스

```
1. 사용자가 "구글로 로그인" 클릭
2. 프론트 → 구글 동의 화면 (client_id, redirect_uri=/auth/callback, scope=openid email profile, response_type=code)
3. 구글 → /auth/callback?code=... 로 리다이렉트
4. 프론트 → POST /api/v1/auth/google { code }
5. 서버 → code를 구글 토큰엔드포인트에서 교환·id_token 검증 → 자체 JWT 발급
6. 응답 { accessToken, refreshToken, expiresIn, user } → 토큰 저장 (auth.ts)
```

> `redirect_uri`는 ① Google Cloud Console 승인된 URI, ② 백엔드 `GOOGLE_REDIRECT_URI`,
> ③ 프론트가 code 발급에 쓴 값이 **모두 동일**해야 교환에 성공합니다 (기본 `http://localhost:3000/auth/callback`).

### 요청/응답

`POST /auth/google`
```json
// req
{ "code": "google-authorization-code" }
// res(data)
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "expiresIn": 3600,
  "user": { "id": "uuid", "email": "...", "name": "...", "profileImageUrl": "..." }
}
```

`POST /auth/refresh` — `{ "refreshToken": "..." }` → 동일 형식(새 accessToken)
`POST /auth/logout` (인증 필요) · `DELETE /auth/account` (인증 필요, 회원 탈퇴)

### 토큰 만료/갱신

- Access 1시간 / Refresh 30일
- 401 `AUTH_002`(만료) 응답 시 `apiFetch`가 `/auth/refresh`로 **1회 자동 갱신 후 재시도**
- `AUTH_007`(refresh 무효) → 토큰 폐기 후 로그인 페이지로

---

## 4. 에러 처리

`apiFetch`는 `success === false`거나 HTTP 비정상 시 `ApiError`를 던집니다.

```ts
import { ApiError, ErrorCode } from "@/lib/api/errors"

try {
  const file = await apiFetch<FileDetail>(`/files/${id}`)
} catch (e) {
  if (e instanceof ApiError) {
    switch (e.code) {
      case ErrorCode.FILE_NOT_FOUND:     /* 404 처리 */ break
      case ErrorCode.AUTH_TOKEN_EXPIRED: /* 재로그인 */ break
      default: toast(e.message)  // 백엔드 message는 사용자 표시용 한글
    }
  }
}
```

전체 코드 목록은 `ERROR_CODE.md`, 상수는 `src/lib/api/errors.ts`.

자주 쓰는 코드:

| code | 상황 | 프론트 처리 |
|------|------|-------------|
| `AUTH_001` | 토큰 없음 | 로그인 유도 |
| `AUTH_002` | Access 만료 | 자동 갱신(apiFetch가 처리) |
| `AUTH_007` | Refresh 무효 | 로그아웃 → 로그인 |
| `FILE_002` | 미지원 형식 | 업로드 전 검증 메시지 |
| `FILE_003` | 용량 초과 | 업로드 전 검증 메시지 |
| `AI_001` | 생성 진행중 | 버튼 비활성/대기 |
| `AI_004` | 분석 미완료 | 분석 완료 후 재시도 안내 |
| `COMMON_001` | 유효성 실패 | 폼 에러 표시 |
| `COMMON_003` | Rate limit | 잠시 후 재시도 |

---

## 5. 파일 업로드 (multipart)

`POST /files/upload`는 `multipart/form-data`라 JSON 래퍼와 다릅니다 (`Content-Type` 수동 지정 금지 — 브라우저가 boundary 설정).

```ts
import { uploadFile } from "@/lib/api/upload"

// 업로드 전 MIME + 확장자 검증을 포함한다 (PDF/PNG/JPG). 서버도 이중 검증(FILE_002).
const res = await uploadFile(file, { folderId })
// res: { id, name, fileType, fileSize, folderId, status, createdAt }
```

---

## 6. 비동기(AI) 작업 — 상태 폴링

노트/빈칸/분석 생성은 비동기입니다. 생성 요청 → `jobId`/`status: PENDING` → 상태 폴링.

```
POST /files/{id}/notes/generate  → { noteId, jobId, status: "PENDING" }
GET  /files/{id}/notes/{noteId}/status (polling) → status: PENDING|PROCESSING|COMPLETED|FAILED
COMPLETED 시 GET /files/{id}/notes/{noteId} 로 본문 조회
```

- 폴링 간격 2~3초, 지수 백오프 권장. `COMPLETED`/`FAILED`에서 중단.
- 분석(`/files/{id}/analysis/status`)도 동일 패턴. 분석 미완료 시 노트/빈칸 생성은 `AI_004`.

---

## 7. PDF Export

`GET /files/{id}/notes/{noteId}/export` 등은 `application/pdf` **바이너리**입니다 (JSON 래퍼 아님).

```ts
import { apiFetchBlob } from "@/lib/api/client"

const blob = await apiFetchBlob(`/files/${id}/blanks/${blankId}/export?includeAnswer=false`)
const url = URL.createObjectURL(blob)   // 다운로드/미리보기
```

---

## 8. CORS

- 백엔드 `cors.allowed-origins` 기본값 `http://localhost:3000`.
- 배포 도메인이 생기면 백엔드에 오리진 추가 요청 (쉼표 구분).
- `allowCredentials(true)` 이므로 와일드카드 오리진 불가. 쿠키 인증 시 정확한 오리진 필요.

---

## 9. 엔드포인트 현황

배포된 OpenAPI(`{API_BASE}/v3/api-docs`, Swagger `{API_BASE}/swagger-ui/index.html`) 기준.
타입은 `src/lib/api/schema.d.ts`(생성물), 별칭은 `src/lib/api/types.ts`.

### 구현됨 (배포 확인)

| 도메인 | 엔드포인트 |
|--------|-----------|
| Auth | `POST /auth/google`, `POST /auth/refresh`, `POST /auth/logout`, `DELETE /auth/account` |
| User | `GET /users/me`, `PUT /users/me` |
| Folder | `GET /folders`, `POST /folders`, `GET/PUT/DELETE /folders/{folderId}` |
| Folder(부가) | `PATCH /folders/{folderId}/move`, `PATCH /folders/{folderId}/favorite`, `GET /folders/{folderId}/delete-preview`, `GET /folders/favorites` |

### 계획 (아직 미배포)

`File`(`/files`, `/files/upload`), `Search`, `Analysis`, `Note`, `Blank`, `Export` 도메인은 현재 배포 스펙에
없음. 관련 FE 코드(예: `src/lib/api/upload.ts`)는 백엔드 추가 후 동작하는 **전방 스텁**이다.
추가되면 `/sync-api`(또는 `pnpm gen:api:prod`)로 타입 재생성.

전체·요청/응답 예시는 Swagger UI / 백엔드 `API_SPEC.md`.

---
참조: `ERROR_CODE.md`(코드), `CLAUDE.md`(연동 규칙), 백엔드 `API_SPEC.md` / `ENV.md`.
