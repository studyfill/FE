export type UserFilePdfPage = {
  pageNumber: number
  text: string
}

export type UserFilePdfText = {
  userFileId: string
  extractedAt: string
  pages: UserFilePdfPage[]
}
