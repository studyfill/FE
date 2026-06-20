import {
  UPLOAD_ACCEPTED_EXTENSIONS,
  UPLOAD_MAX_SIZE_MB,
} from "@/constants/upload"
import type { UserFileType } from "@/types/user-file"

export const getFileTypeFromName = (fileName: string): UserFileType | null => {
  const lower = fileName.toLowerCase()
  if (lower.endsWith(".pdf")) return "pdf"
  if (
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png")
  ) {
    return "image"
  }
  return null
}

export const validateUploadFile = (file: File): string | null => {
  const fileType = getFileTypeFromName(file.name)
  if (!fileType) {
    return `지원 형식: ${UPLOAD_ACCEPTED_EXTENSIONS.join(", ")}`
  }
  if (file.size > UPLOAD_MAX_SIZE_MB * 1024 * 1024) {
    return `파일 크기는 ${UPLOAD_MAX_SIZE_MB}MB 이하여야 합니다.`
  }
  return null
}
