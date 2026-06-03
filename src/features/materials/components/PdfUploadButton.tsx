"use client"

import { Upload } from "lucide-react"
import { useRef } from "react"

import { Button } from "@/components/ui/button"

type PdfUploadButtonProps = {
  onUpload: (file: File) => void
  isUploading?: boolean
}

export const PdfUploadButton = ({
  onUpload,
  isUploading = false,
}: PdfUploadButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
      e.target.value = ""
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        onChange={handleChange}
        aria-hidden
      />
      <Button
        type="button"
        disabled={isUploading}
        aria-label="PDF 업로드"
        onClick={() => inputRef.current?.click()}
      >
        <Upload />
        {isUploading ? "업로드 중…" : "PDF 업로드"}
      </Button>
    </>
  )
}
