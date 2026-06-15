// multipart/form-data 파일 업로드 헬퍼. (POST /files/upload)
// client.ts 의 apiFetch 도 FormData 를 지원하지만, 업로드는 사전 검증을 끼워 별도 헬퍼로 둔다.
//
// ⚠️ 전방 스텁: 배포된 백엔드에는 아직 files 도메인(/files/upload)이 없다.
//    백엔드 추가 후 /sync-api 로 타입을 재생성하고 FileDetail 을 schema 기반으로 교체한다.
//
// 참고: src/lib/utils/upload-file.ts 는 클라이언트 측 PDF 처리용으로 역할이 다르다.
// 이 파일은 "백엔드로의 multipart 업로드" 전용이다.

import { apiFetch } from "./client"
import { ApiError, ErrorCode } from "./errors"

const ALLOWED_MIME = ["application/pdf", "image/png", "image/jpeg"]
const ALLOWED_EXT = ["pdf", "png", "jpg", "jpeg"]

export type FileDetail = {
  id: string
  name: string
  fileType: "PDF" | "PNG" | "JPG"
  fileSize: number
  folderId: string | null
  status: string
  createdAt: string
}

/** 업로드 전 클라이언트 측 1차 검증 (서버도 이중 검증함: FILE_002) */
export const validateUploadFile = (file: File): void => {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
  const mimeOk = ALLOWED_MIME.includes(file.type)
  const extOk = ALLOWED_EXT.includes(ext)
  if (!mimeOk || !extOk) {
    throw new ApiError(
      ErrorCode.FILE_UNSUPPORTED_TYPE,
      "지원하지 않는 파일 형식입니다 (PDF, PNG, JPG만 지원)",
      400,
    )
  }
}

export const uploadFile = async (
  file: File,
  opts?: { folderId?: string | null; name?: string },
): Promise<FileDetail> => {
  validateUploadFile(file)

  const fd = new FormData()
  fd.append("file", file)
  if (opts?.folderId) fd.append("folderId", opts.folderId)
  if (opts?.name) fd.append("name", opts.name)

  // Content-Type 은 지정하지 않음 → 브라우저가 multipart boundary 설정
  return apiFetch<FileDetail>("/files/upload", { method: "POST", body: fd })
}
