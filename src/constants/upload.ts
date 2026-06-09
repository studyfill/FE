export const UPLOAD_MAX_SIZE_MB = 50
export const PDF_UPLOAD_MAX_SIZE_MB = UPLOAD_MAX_SIZE_MB
export const PDF_UPLOAD_MAX_PAGES = 100

export const UPLOAD_ACCEPTED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"] as const

export const UPLOAD_ACCEPT_MIME =
  ".pdf,application/pdf,.jpg,.jpeg,.png,image/jpeg,image/png"
