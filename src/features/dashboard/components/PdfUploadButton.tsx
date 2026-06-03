"use client"

import { Plus } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { PdfUploadDialog } from "@/features/dashboard/components/PdfUploadDialog"

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
        disabled={isUploading}
        className="h-9 gap-2 px-3.5 text-[15px] shadow-sm"
        aria-label="PDF 업로드"
        onClick={handleOpen}
      >
        <Plus className="size-4" strokeWidth={2.5} />
        {isUploading ? "업로드 중…" : "업로드"}
      </Button>

      <PdfUploadDialog
        open={open}
        onOpenChange={setOpen}
        onUpload={onUpload}
        isUploading={isUploading}
      />
    </>
  )
}
