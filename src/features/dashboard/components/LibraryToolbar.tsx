"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowDownUp, LayoutGrid, List } from "lucide-react"

import { APP_NAME } from "@/constants"
import { ROUTES } from "@/constants/routes"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { PdfUploadButton } from "@/features/dashboard/components/PdfUploadButton"
import { cn } from "@/lib/utils"
import type { MaterialSort } from "@/types/material"

type LibraryToolbarProps = {
  folderLabel: string
  sort: MaterialSort
  onSortChange: (sort: MaterialSort) => void
  onUpload: (file: File) => Promise<void>
  isUploading: boolean
}

export const LibraryToolbar = ({
  folderLabel,
  sort,
  onSortChange,
  onUpload,
  isUploading,
}: LibraryToolbarProps) => {
  const [view, setView] = useState<"grid" | "list">("grid")

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pb-5">
      <Breadcrumb>
        <BreadcrumbList className="text-sm">
          <BreadcrumbItem>
            <BreadcrumbLink
              render={<Link href={ROUTES.dashboard} />}
              className="text-muted-foreground hover:text-foreground"
            >
              {APP_NAME}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-normal text-foreground/80">
              {folderLabel}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-2.5">
        <div
          className="flex items-center rounded-lg border border-border p-0.5"
          role="group"
          aria-label="보기 방식"
        >
          <Button
            type="button"
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon-sm"
            className="size-8"
            aria-label="그리드 보기"
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            type="button"
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon-sm"
            className="size-8"
            aria-label="목록 보기"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <List className="size-4" />
          </Button>
        </div>

        <div className="relative">
          <ArrowDownUp
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as MaterialSort)}
            className={cn(
              "h-9 min-w-[96px] appearance-none rounded-lg border border-border bg-background py-1 pr-8 pl-9 text-[15px]",
              "cursor-pointer transition-colors hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            )}
            aria-label="정렬"
          >
            <option value="date">정렬</option>
            <option value="folder">과목별</option>
          </select>
        </div>

        <PdfUploadButton onUpload={onUpload} isUploading={isUploading} />
      </div>
    </header>
  )
}
