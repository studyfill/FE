// 자료(files) 백엔드 연동. BFF 라우트(src/app/api/files/**)를 통해 same-origin 으로 호출한다.
// (백엔드 직접 호출이 아니므로 apiFetch 가 아닌 bffFetch 사용 — 토큰은 서버 세션 쿠키에서만 읽힘)
//
// 참고: src/lib/utils/upload-file.ts(클라 측 검증)와 역할이 다르다. 여기는 백엔드 연동 전용.

import { bffFetch } from "./client"
import type {
  FileMoveRequest,
  FileResponse,
  FileUpdateRequest,
  PageResponseFileResponse,
} from "./types"
import type { ExtractionStatus, Material, MaterialFileType } from "@/types/material"

export { validateUploadFile } from "@/lib/utils/upload-file"

// 백엔드 analysisStatus(자유 문자열)를 프론트 ExtractionStatus 로 매핑. 알 수 없으면 done.
const mapAnalysisStatus = (status?: string): ExtractionStatus => {
  switch (status?.toLowerCase()) {
    case "pending":
    case "queued":
      return "pending"
    case "processing":
    case "analyzing":
    case "in_progress":
      return "processing"
    case "failed":
    case "error":
      return "failed"
    default:
      return "done"
  }
}

const mapFileType = (fileType?: string): MaterialFileType =>
  fileType?.toUpperCase() === "PDF" ? "pdf" : "image"

/**
 * 백엔드 FileResponse → 프론트 Material.
 * 진행상태(currentPage/progressPercent)는 백엔드에 없어 기본값(1/0)으로 둔다.
 * 실제 진행상태는 호출부에서 로컬 미러(mock store)와 병합한다.
 */
export const mapFileToMaterial = (file: FileResponse): Material => ({
  id: file.id ?? "",
  name: file.name ?? file.originalName ?? "제목 없는 자료",
  folderId: file.folderId ?? null,
  fileType: mapFileType(file.fileType),
  uploadedAt: file.createdAt ?? new Date().toISOString(),
  extractionStatus: mapAnalysisStatus(file.analysisStatus),
  pageCount: file.pageCount ?? 0,
  currentPage: 1,
  progressPercent: 0,
  lastStudiedAt: file.lastViewedAt ?? null,
})

/** 폴더별 자료 목록. folderId 가 null 이면 전체(루트 포함). */
export const listFiles = async (
  folderId: string | null,
): Promise<Material[]> => {
  const search = new URLSearchParams({ page: "0", size: "100" })
  if (folderId) search.set("folderId", folderId)
  const page = await bffFetch<PageResponseFileResponse>(
    `/files?${search.toString()}`,
  )
  return (page.content ?? []).map(mapFileToMaterial)
}

/** multipart 업로드. folderId/name 은 쿼리 파라미터로 전달된다(백엔드 계약). */
export const uploadFileToBackend = (
  file: File,
  opts?: { folderId?: string | null; name?: string },
): Promise<FileResponse> => {
  const search = new URLSearchParams()
  if (opts?.folderId) search.set("folderId", opts.folderId)
  if (opts?.name) search.set("name", opts.name)
  const qs = search.toString()

  const form = new FormData()
  form.append("file", file)

  return bffFetch<FileResponse>(`/files/upload${qs ? `?${qs}` : ""}`, {
    method: "POST",
    body: form,
  })
}

export const moveFile = (
  fileId: string,
  targetFolderId: string,
): Promise<FileResponse> =>
  bffFetch<FileResponse>(`/files/${fileId}/move`, {
    method: "PATCH",
    body: { targetFolderId } satisfies FileMoveRequest,
  })

export const renameFile = (
  fileId: string,
  name: string,
): Promise<FileResponse> =>
  bffFetch<FileResponse>(`/files/${fileId}`, {
    method: "PUT",
    body: { name } satisfies FileUpdateRequest,
  })

export const deleteFile = (fileId: string): Promise<void> =>
  bffFetch<void>(`/files/${fileId}`, { method: "DELETE" })
