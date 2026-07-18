# 백엔드 변경 요청 — 폴더 색상(color) + 자료 개수(fileCount)

> 요청: StudyFill FE
> 대상: `studyfill/BE` (folders 도메인)
> 목적: 폴더 색상 지정/표시 + 폴더별 자료 개수 표시를 위해 폴더 DTO에 필드 추가

## 배경

프론트는 폴더에 **색상**을 지정/표시하고(폴더 생성 다이얼로그에서 사용자가 색 선택),
폴더별 **자료 개수**("자료 N개")를 카드·사이드바·최근 폴더에 노출합니다.

현재 배포 백엔드의 폴더 DTO에는 두 필드가 모두 없습니다.

- `FolderCreateRequest` = `{ name, parentId }` — color 없음
- `FolderResponse` = `{ id, parentId, name, depth, favorite, createdAt }` — color / materialCount 없음

그래서 프론트가 색을 보내도 저장/반환되지 않고, 폴더별 자료 수도 받을 수 없습니다.
이 필드들이 추가되면 프론트는 색을 서버에 영구 저장하고(모든 기기 동일), 자료 수를 그대로 표시합니다.

---

## 1) `color` 필드 추가

### 값 (enum, 8종)

프론트 `FOLDER_COLOR_IDS`와 1:1로 일치해야 합니다.

```
red | orange | yellow | green | blue | indigo | violet | pink
```

- 기본값: `green`
- enum 검증은 백엔드에서 해주면 좋고, 아니어도 프론트가 보정 가능

### 변경 대상 DTO

| DTO | 변경 |
|-----|------|
| `FolderCreateRequest` | `color: String` 추가 (required, 위 enum 중 하나) |
| `FolderUpdateRequest` | `color: String` 추가 (선택 — 추후 색 변경 기능용. 가능하면 같이) |
| `FolderResponse` | `color: String` 추가 (저장값 반환) |
| `FolderDetailResponse` | `color: String` 추가 (subFolders 항목에도 포함) |

→ 폴더 엔티티에 `color` 컬럼 추가 + 저장/반환.

---

## 2) `fileCount` (폴더별 자료 개수) 추가

> 프론트는 폴더별 자료 개수를 `fileCount` 라는 이름으로 씁니다.
> (`GET /folders/{id}/delete-preview` 응답이 이미 쓰는 `fileCount` 와 동일한 이름 — 일관성 유지)

### 변경 대상 DTO (`FolderResponse` / `FolderDetailResponse`)

```
fileCount: Integer   // 해당 폴더 직속(direct) 자료 수
```

- 우선 **직속 개수**만 있어도 충분합니다(하위 폴더 합산은 프론트가 트리에서 처리 가능).
- 가능하면 하위 포함 여부를 구분해주면 더 좋습니다 (필수 아님):
  - `fileCount` = 직속 자료 수
  - `totalCount` = 하위 폴더 포함 합계

---

## 영향받는 엔드포인트

아래 엔드포인트의 응답에 위 필드(`color`, `materialCount`)가 포함되면 됩니다.

- `POST /folders` (생성)
- `GET /folders` (루트 목록)
- `GET /folders/favorites`
- `GET /folders/{folderId}` (상세 — subFolders 포함)
- `PUT /folders/{folderId}` (수정)
- `PATCH /folders/{folderId}/move`
- `PATCH /folders/{folderId}/favorite`

---

## 적용 예시 (참고)

### 요청 — `POST /folders`

```json
{
  "name": "운영체제",
  "parentId": "a1b2c3d4-....",
  "color": "blue"
}
```

### 응답 — `FolderResponse`

```json
{
  "success": true,
  "data": {
    "id": "f0e1d2c3-....",
    "parentId": "a1b2c3d4-....",
    "name": "운영체제",
    "depth": 1,
    "favorite": false,
    "color": "blue",
    "fileCount": 0,
    "createdAt": "2026-06-20T12:34:56Z"
  },
  "code": "...",
  "message": "..."
}
```

---

## 반영 후 프론트 진행 (FE 측 작업, 참고용)

1. `pnpm gen:api:prod` (또는 `/sync-api`)로 `schema.d.ts` 재생성 — 새 필드 반영
2. `src/lib/api/folders.ts` + BFF 라우트 `src/app/api/folders/**` 생성 (files 패턴 미러)
3. `useDashboardLibrary` · 사이드바 트리 · 검색 · 최근 폴더 · 랜딩의 mock 폴더 호출을 백엔드 호출로 교체
4. 폴더 ID가 실제 UUID가 되어 `GET /files?folderId=...` 의 500 (COMMON_002 "서버 내부 오류") 해소
   - (현재 버그: mock 폴더 ID가 `folder-{timestamp}` 형식이라 백엔드의 UUID 파싱이 실패해 500 발생)
