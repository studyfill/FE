"use client"

import { Plus } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { FileUploadDialog } from "@/features/library/components/FileUploadDialog"

type PdfUploadButtonProps = {
  onUpload: (file: File) => Promise<void>
  isUploading?: boolean
}

export const PdfUploadButton = ({
  onUpload,
  isUploading = false,
}: PdfUploadButtonProps) => {
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(true)
  }

  return (
    <>
      <Button
        type="button"
        size="lg"
        disabled={isUploading}
        className="gap-1.5 px-3.5 text-body font-medium leading-none bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
        aria-label="PDF 업로드"
        onClick={handleOpen}
      >
        <Plus className="size-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
        <span>{isUploading ? "업로드 중…" : "업로드"}</span>
      </Button>

      <FileUploadDialog
        open={open}
        onOpenChange={setOpen}
        onUpload={onUpload}
        isUploading={isUploading}
      />
    </>
  )
}
