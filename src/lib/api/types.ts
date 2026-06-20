// 백엔드 OpenAPI 생성 타입(schema.d.ts)의 편의 별칭.
// 컴포넌트/훅/서버에서 도메인 타입을 import 할 때 이 파일을 쓴다.
// schema.d.ts 는 생성물(직접 수정 금지) — 갱신은 `pnpm gen:api`(로컬) / `pnpm gen:api:prod`(배포) / /sync-api.
//
// 주의: springdoc 특성상 응답 필드가 대부분 optional(?)로 생성된다. 사용처에서 좁혀 쓴다.

import type { components } from "./schema"

type Schemas = components["schemas"]

// Auth
export type GoogleLoginRequest = Schemas["GoogleLoginRequest"]
export type RefreshRequest = Schemas["RefreshRequest"]
export type AuthResponse = Schemas["AuthResponse"]
export type UserSummary = Schemas["UserSummary"]

// User
export type UserProfileResponse = Schemas["UserProfileResponse"]
export type UpdateProfileRequest = Schemas["UpdateProfileRequest"]

// Folder
export type FolderResponse = Schemas["FolderResponse"]
export type FolderDetailResponse = Schemas["FolderDetailResponse"]
export type FolderCreateRequest = Schemas["FolderCreateRequest"]
export type FolderUpdateRequest = Schemas["FolderUpdateRequest"]
export type FolderMoveRequest = Schemas["FolderMoveRequest"]
export type FolderDeletePreviewResponse = Schemas["FolderDeletePreviewResponse"]

// File
export type FileResponse = Schemas["FileResponse"]
export type FileMoveRequest = Schemas["FileMoveRequest"]
export type FileUpdateRequest = Schemas["FileUpdateRequest"]
export type FileDownloadResponse = Schemas["FileDownloadResponse"]
export type PageResponseFileResponse = Schemas["PageResponseFileResponse"]

// Search
export type SearchResponse = Schemas["SearchResponse"]
export type FolderSearchResult = Schemas["FolderSearchResult"]
export type FileSearchResult = Schemas["FileSearchResult"]
