# API Specification

> 백엔드(`studyfill/BE`)가 작성한 전체 API 명세. 개발할 API 목록·요청/응답 계약 확인용 단일 참조.
> 실제 타입은 OpenAPI 생성물(`src/lib/api/schema.d.ts`)이 진실 소스이며, 갱신은 `/sync-api`.
> 연동 상세(래퍼·인증·폴링·export·CORS)는 [API_INTEGRATION.md](API_INTEGRATION.md), 코드 목록은 [ERROR_CODE.md](ERROR_CODE.md).

## 공통 규칙

- **Base URL**: `/api/v1`
- **Content-Type**: `application/json`
- **인증**: `Authorization: Bearer {accessToken}` (명시 없으면 인증 필요)
- **인코딩**: UTF-8

## 공통 응답 포맷

성공/실패 모두 동일한 평면 구조를 사용합니다. 모든 응답은 `success`, `data`, `code`, `message` 4개 필드를 가집니다.

| 필드 | 타입 | 설명 |
|------|------|------|
| `success` | boolean | 성공 여부 |
| `data` | object/array/null | 응답 데이터 (실패 시 null) |
| `code` | string | 성공/에러 코드 (예: `COMMON_200`, `FILE_001`) |
| `message` | string | 사용자 표시용 메시지 |

### 성공 응답

```json
{
  "success": true,
  "data": { ... },
  "code": "COMMON_200",
  "message": "요청이 정상 처리되었습니다"
}
```

### 에러 응답

```json
{
  "success": false,
  "data": null,
  "code": "FILE_001",
  "message": "파일을 찾을 수 없습니다"
}
```

코드 전체 목록(에러 + 성공) → [ERROR_CODE.md](ERROR_CODE.md)

> 아래 각 엔드포인트의 Request/Response 예시는 가독성을 위해 `data` 내부의 payload만 표기합니다.
> 실제 응답은 위 공통 포맷으로 래핑됩니다.

## 페이지네이션 응답 (목록 API)

`data` 안에 페이지 정보를 포함합니다.

```json
{
  "success": true,
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5,
    "last": false
  },
  "code": "COMMON_200",
  "message": "요청이 정상 처리되었습니다"
}
```

---

## Auth

| Method | Path | 설명 | Auth | MVP |
|--------|------|------|------|-----|
| POST | `/auth/google` | 구글 OAuth 로그인 (authorization code 교환 → JWT 발급) | X | O |
| POST | `/auth/refresh` | Access Token 재발급 | X | O |
| POST | `/auth/logout` | 로그아웃 (Refresh Token 무효화) | O | O |
| DELETE | `/auth/account` | 회원 탈퇴 | O | O |

### POST /auth/google

프론트가 구글 동의 화면에서 발급받은 authorization `code`를 전달합니다.
서버가 `code`를 구글 토큰 엔드포인트에서 교환(`client_id` + `client_secret` + `redirect_uri`)하고,
응답 id_token을 검증해 사용자 정보를 추출한 뒤 자체 JWT를 발급합니다.

Request:
```json
{
  "code": "google-authorization-code"
}
```

Response:
```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "expiresIn": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "profileImageUrl": "https://..."
  }
}
```

### POST /auth/refresh

Request:
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

Response: 동일 형식 (새 accessToken 포함)

---

## Users

| Method | Path | 설명 | Auth | MVP |
|--------|------|------|------|-----|
| GET | `/users/me` | 내 프로필 조회 | O | O |
| PUT | `/users/me` | 프로필 수정 | O | O |

### GET /users/me

Response:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "홍길동",
  "profileImageUrl": "https://...",
  "plan": "FREE",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### PUT /users/me

Request:
```json
{
  "name": "새 이름"
}
```

---

## Folders

| Method | Path | 설명 | Auth | MVP |
|--------|------|------|------|-----|
| GET | `/folders` | 루트 폴더 목록 조회 | O | O |
| POST | `/folders` | 폴더 생성 | O | O |
| GET | `/folders/{folderId}` | 폴더 상세 조회 (하위 폴더/파일 포함) | O | O |
| PUT | `/folders/{folderId}` | 폴더 이름 수정 | O | O |
| DELETE | `/folders/{folderId}` | 폴더 삭제 (하위 포함) | O | O |
| PATCH | `/folders/{folderId}/move` | 폴더 이동 | O | O |
| PATCH | `/folders/{folderId}/favorite` | 즐겨찾기 토글 | O | O |
| GET | `/folders/favorites` | 즐겨찾기 폴더 목록 | O | O |
| GET | `/folders/{folderId}/delete-preview` | 삭제 시 영향 범위 미리보기 | O | O |

### POST /folders

Request:
```json
{
  "name": "폴더 이름",
  "parentId": "uuid or null (루트)"
}
```

### PATCH /folders/{folderId}/move

Request:
```json
{
  "targetParentId": "uuid or null (루트로 이동)"
}
```

### GET /folders/{folderId}/delete-preview

Response:
```json
{
  "subFolderCount": 3,
  "fileCount": 10
}
```

---

## Files

| Method | Path | 설명 | Auth | MVP |
|--------|------|------|------|-----|
| GET | `/files` | 파일 목록 (폴더 ID 필터 가능) | O | O |
| POST | `/files/upload` | 파일 업로드 (multipart/form-data) | O | O |
| GET | `/files/recent` | 최근 열람 파일 목록 | O | O |
| GET | `/files/{fileId}` | 파일 상세 조회 | O | O |
| GET | `/files/{fileId}/download-url` | 파일 다운로드 URL 발급 (뷰어용) | O | O |
| PUT | `/files/{fileId}` | 파일 이름 수정 | O | O |
| DELETE | `/files/{fileId}` | 파일 삭제 | O | O |
| PATCH | `/files/{fileId}/move` | 파일 이동 | O | O |
| POST | `/files/{fileId}/view` | 최근 열람 기록 갱신 | O | O |

### GET /files

Query Params:
- `folderId`: 폴더 ID (없으면 루트)
- `page`, `size`: 페이지네이션

### POST /files/upload

Request (multipart/form-data):
- `file`: 파일 (PDF, PNG, JPG)
- `folderId`: 저장할 폴더 ID (null이면 루트)
- `name`: 파일 이름 (선택, 없으면 원본 파일명 사용)

Response:
```json
{
  "id": "uuid",
  "name": "파일명.pdf",
  "fileType": "PDF",
  "fileSize": 1048576,
  "folderId": "uuid or null",
  "status": "UPLOADED",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### PATCH /files/{fileId}/move

Request:
```json
{
  "targetFolderId": "uuid or null (루트로 이동)"
}
```

### GET /files/{fileId}/download-url

비공개 스토리지에 저장된 파일을 뷰어/다운로드에서 직접 가져오기 위한 URL을 발급한다.
운영(S3)은 presigned GET URL, 개발(local)은 콘텐츠 스트리밍 URL을 반환한다.
URL은 `expiresIn`(초) 동안만 유효하다.

Response:
```json
{
  "url": "https://studyfill-bucket-...s3.ap-northeast-2.amazonaws.com/...?X-Amz-Signature=...",
  "expiresIn": 600
}
```

---

## Search

| Method | Path | 설명 | Auth | MVP |
|--------|------|------|------|-----|
| GET | `/search` | 폴더 + 파일 통합 검색 | O | O |

### GET /search

Query Params:
- `q`: 검색어 (필수)
- `type`: `FOLDER`, `FILE`, `ALL` (기본값: ALL)

Response:
```json
{
  "folders": [
    {
      "id": "uuid",
      "name": "폴더명",
      "path": "루트 > 상위폴더 > 폴더명"
    }
  ],
  "files": [
    {
      "id": "uuid",
      "name": "파일명.pdf",
      "path": "루트 > 상위폴더 > 파일명.pdf",
      "fileType": "PDF"
    }
  ]
}
```

---

## Analysis

| Method | Path | 설명 | Auth | MVP |
|--------|------|------|------|-----|
| POST | `/files/{fileId}/analysis` | 분석 시작 | O | O |
| GET | `/files/{fileId}/analysis` | 분석 결과 조회 | O | O |
| GET | `/files/{fileId}/analysis/status` | 분석 상태 조회 | O | O |

### POST /files/{fileId}/analysis

Response:
```json
{
  "jobId": "uuid",
  "status": "PENDING"
}
```

### GET /files/{fileId}/analysis/status

Response:
```json
{
  "jobId": "uuid",
  "status": "PENDING | PROCESSING | COMPLETED | FAILED",
  "errorMessage": null
}
```

---

## Notes (AI 설명 노트)

| Method | Path | 설명 | Auth | MVP |
|--------|------|------|------|-----|
| GET | `/files/{fileId}/notes` | 노트 목록 (버전) | O | O |
| POST | `/files/{fileId}/notes/generate` | 노트 생성 요청 | O | O |
| GET | `/files/{fileId}/notes/{noteId}` | 노트 상세 | O | O |
| PUT | `/files/{fileId}/notes/{noteId}` | 노트 편집 저장 | O | O |
| DELETE | `/files/{fileId}/notes/{noteId}` | 노트 삭제 | O | O |
| GET | `/files/{fileId}/notes/{noteId}/status` | 생성 상태 polling | O | O |
| GET | `/files/{fileId}/notes/{noteId}/export` | PDF Export | O | O |

### POST /files/{fileId}/notes/generate

Request:
```json
{
  "style": "EASY | DETAILED",
  "pageRange": {
    "start": 1,
    "end": 10
  }
}
```

Response:
```json
{
  "noteId": "uuid",
  "jobId": "uuid",
  "status": "PENDING"
}
```

### GET /files/{fileId}/notes/{noteId}

Response:
```json
{
  "id": "uuid",
  "fileId": "uuid",
  "style": "EASY",
  "content": "...(HTML or JSON 형식의 노트 내용)...",
  "status": "COMPLETED",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### PUT /files/{fileId}/notes/{noteId}

Request:
```json
{
  "content": "...(수정된 노트 내용)..."
}
```

### GET /files/{fileId}/notes/{noteId}/export

Query Params:
- (없음)

Response: `application/pdf` 바이너리 스트림

---

## Blanks (빈칸 학습)

| Method | Path | 설명 | Auth | MVP |
|--------|------|------|------|-----|
| GET | `/files/{fileId}/blanks` | 빈칸 목록 (버전) | O | O |
| POST | `/files/{fileId}/blanks/generate` | 빈칸 생성 요청 | O | O |
| GET | `/files/{fileId}/blanks/{blankId}` | 빈칸 상세 | O | O |
| PUT | `/files/{fileId}/blanks/{blankId}` | 빈칸 편집 | O | O |
| DELETE | `/files/{fileId}/blanks/{blankId}` | 빈칸 삭제 | O | O |
| POST | `/files/{fileId}/blanks/{blankId}/submit` | 답안 제출 및 채점 | O | O |
| GET | `/files/{fileId}/blanks/{blankId}/status` | 생성 상태 polling | O | O |
| GET | `/files/{fileId}/blanks/{blankId}/export` | PDF Export | O | O |

### POST /files/{fileId}/blanks/generate

Request:
```json
{
  "sourceType": "ORIGINAL | NOTE",
  "noteId": "uuid (sourceType=NOTE일 때)",
  "difficulty": "EASY | MEDIUM | HARD"
}
```

### GET /files/{fileId}/blanks/{blankId}

Response:
```json
{
  "id": "uuid",
  "fileId": "uuid",
  "sourceType": "ORIGINAL",
  "difficulty": "MEDIUM",
  "status": "COMPLETED",
  "items": [
    {
      "id": "uuid",
      "sequence": 1,
      "text": "빈칸이 포함된 문장 텍스트",
      "blankPositions": [
        {
          "start": 5,
          "end": 8,
          "answer": "정답"
        }
      ],
      "hint": "힌트 설명",
      "sourcePage": 3
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### POST /files/{fileId}/blanks/{blankId}/submit

Request:
```json
{
  "answers": [
    {
      "itemId": "uuid",
      "userAnswer": "사용자 입력 답안"
    }
  ]
}
```

Response:
```json
{
  "totalCount": 20,
  "correctCount": 15,
  "correctRate": 75.0,
  "results": [
    {
      "itemId": "uuid",
      "userAnswer": "사용자 입력",
      "correct": true,
      "correctAnswer": "정답"
    }
  ]
}
```

### GET /files/{fileId}/blanks/{blankId}/export

Query Params:
- `includeAnswer`: `true | false` (정답 포함 여부)

Response: `application/pdf` 바이너리 스트림

---

## Quizzes (Full only)

| Method | Path | 설명 | Auth | MVP |
|--------|------|------|------|-----|
| GET | `/files/{fileId}/quizzes` | 퀴즈 목록 (버전) | O | X |
| POST | `/files/{fileId}/quizzes/generate` | 퀴즈 생성 요청 | O | X |
| GET | `/files/{fileId}/quizzes/{quizId}` | 퀴즈 상세 | O | X |
| PUT | `/files/{fileId}/quizzes/{quizId}` | 퀴즈 편집 | O | X |
| DELETE | `/files/{fileId}/quizzes/{quizId}` | 퀴즈 삭제 | O | X |
| POST | `/files/{fileId}/quizzes/{quizId}/submit` | 답안 제출 및 채점 | O | X |
| GET | `/files/{fileId}/quizzes/{quizId}/status` | 생성 상태 polling | O | X |
| GET | `/files/{fileId}/quizzes/{quizId}/export` | PDF Export | O | X |

### POST /files/{fileId}/quizzes/generate

Request:
```json
{
  "noteId": "uuid (기반 노트)",
  "questionType": "MULTIPLE_CHOICE | SHORT_ANSWER | OX",
  "difficulty": "EASY | MEDIUM | HARD",
  "count": 10
}
```

---

## Tutor (Full only)

| Method | Path | 설명 | Auth | MVP |
|--------|------|------|------|-----|
| GET | `/files/{fileId}/tutor/messages` | 채팅 기록 조회 | O | X |
| POST | `/files/{fileId}/tutor/messages` | 메시지 전송 | O | X |
| DELETE | `/files/{fileId}/tutor/messages` | 채팅 기록 삭제 | O | X |

### POST /files/{fileId}/tutor/messages

Request:
```json
{
  "message": "질문 내용"
}
```

Response:
```json
{
  "id": "uuid",
  "role": "ASSISTANT",
  "message": "AI 답변",
  "suggestedQuestions": ["후속 질문 1", "후속 질문 2"],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## Review (Full only)

| Method | Path | 설명 | Auth | MVP |
|--------|------|------|------|-----|
| GET | `/review/today` | 오늘 복습 목록 | O | X |
| GET | `/review/scheduled` | 예정된 복습 목록 | O | X |
| GET | `/review/completed` | 완료된 복습 목록 | O | X |
| PATCH | `/review/{reviewId}/complete` | 복습 완료 처리 | O | X |

---

## Notifications (Full only)

| Method | Path | 설명 | Auth | MVP |
|--------|------|------|------|-----|
| GET | `/notifications` | 알림 목록 | O | X |
| PATCH | `/notifications/{notificationId}/read` | 알림 읽음 처리 | O | X |
| PATCH | `/notifications/read-all` | 전체 읽음 처리 | O | X |
| DELETE | `/notifications/{notificationId}` | 알림 삭제 | O | X |

---

## Subscriptions (Full only)

| Method | Path | 설명 | Auth | MVP |
|--------|------|------|------|-----|
| GET | `/subscriptions/me` | 내 구독 정보 | O | X |
| GET | `/subscriptions/plans` | 플랜 목록 조회 | X | X |

---

## Internal (AI Worker Callback)

AI Worker → Spring Boot 전용 내부 API. 외부 노출 없음.

| Method | Path | 설명 |
|--------|------|------|
| POST | `/internal/ai/callback` | AI Worker 작업 완료 콜백 |

Request:
```json
{
  "jobId": "uuid",
  "status": "COMPLETED | FAILED",
  "result": { ... },
  "errorMessage": null
}
```

인증: `X-Internal-Secret: {INTERNAL_CALLBACK_SECRET}` 헤더
