"use client"

import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useImageBlob } from "@/features/pdf/hooks/useImageBlob"
import type { Material } from "@/types/material"

type ImageViewerProps = {
  material: Material
}

export const ImageViewer = ({ material }: ImageViewerProps) => {
  const { objectUrl, isLoading, hasBlob } = useImageBlob(material.id)
  const displayName = material.name.replace(/\.(jpg|jpeg|png)$/i, "")

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground">이미지 · 1p</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled
            aria-label="검색 (준비 중)"
          >
            <Search className="size-4" />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20">
        {isLoading ? (
          <div className="flex min-h-full items-center justify-center p-4">
            <p className="text-sm text-muted-foreground">이미지를 불러오는 중…</p>
          </div>
        ) : hasBlob === false || !objectUrl ? (
          <div className="flex min-h-full items-center justify-center p-4">
            <p className="text-sm text-muted-foreground">이미지 파일을 찾을 수 없습니다.</p>
          </div>
        ) : (
          <div className="flex justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={objectUrl}
              alt={material.name}
              className="max-h-full max-w-full rounded-lg shadow-sm"
            />
          </div>
        )}
      </div>
    </div>
  )
}
