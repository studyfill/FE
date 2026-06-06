"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  ArrowDownUp,
  Check,
  ChevronDown,
  LayoutGrid,
  List,
} from "lucide-react"

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
import type { Folder, MaterialSort, MaterialViewLayout } from "@/types/material"

const SORT_OPTIONS: { value: MaterialSort; label: string }[] = [
  { value: "date", label: "최신순" },
  { value: "folder", label: "폴더순" },
]

type LibraryToolbarProps = {
  folderPath: Folder[]
  sort: MaterialSort
  viewLayout: MaterialViewLayout
  onSortChange: (sort: MaterialSort) => void
  onViewLayoutChange: (layout: MaterialViewLayout) => void
  onUpload: (file: File) => Promise<void>
  isUploading: boolean
}

export const LibraryToolbar = ({
  folderPath,
  sort,
  viewLayout,
  onSortChange,
  onViewLayoutChange,
  onUpload,
  isUploading,
}: LibraryToolbarProps) => {
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "최신순"

  useEffect(() => {
    if (!sortOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!sortRef.current?.contains(event.target as Node)) {
        setSortOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [sortOpen])

  const handleSortSelect = (value: MaterialSort) => {
    onSortChange(value)
    setSortOpen(false)
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pb-5">
      <Breadcrumb>
        <BreadcrumbList className="flex-wrap text-sm">
          <BreadcrumbItem>
            <BreadcrumbLink
              render={<Link href={ROUTES.dashboard} />}
              className="text-muted-foreground hover:text-foreground"
            >
              {APP_NAME}
            </BreadcrumbLink>
          </BreadcrumbItem>

          {folderPath.length === 0 ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-normal text-foreground/80">
                  내 라이브러리
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  render={<Link href={ROUTES.dashboard} />}
                  className="text-muted-foreground hover:text-foreground"
                >
                  내 라이브러리
                </BreadcrumbLink>
              </BreadcrumbItem>
              {folderPath.map((folder, index) => {
                const isLast = index === folderPath.length - 1
                return (
                  <span key={folder.id} className="contents">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="font-normal text-foreground/80">
                          {folder.name}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          render={
                            <Link href={ROUTES.dashboardFolder(folder.id)} />
                          }
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {folder.name}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </span>
                )
              })}
            </>
          )}
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
            variant={viewLayout === "grid" ? "secondary" : "ghost"}
            size="icon-sm"
            className="size-8"
            aria-label="카드 보기"
            aria-pressed={viewLayout === "grid"}
            onClick={() => onViewLayoutChange("grid")}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            type="button"
            variant={viewLayout === "list" ? "secondary" : "ghost"}
            size="icon-sm"
            className="size-8"
            aria-label="목록 보기"
            aria-pressed={viewLayout === "list"}
            onClick={() => onViewLayoutChange("list")}
          >
            <List className="size-4" />
          </Button>
        </div>

        <div ref={sortRef} className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1 px-2.5 text-sm font-normal"
            aria-label="정렬"
            aria-expanded={sortOpen}
            aria-haspopup="menu"
            onClick={() => setSortOpen((open) => !open)}
          >
            <ArrowDownUp className="size-4 shrink-0 text-muted-foreground" />
            <span>{sortLabel}</span>
            <ChevronDown
              className={cn(
                "size-3.5 shrink-0 text-muted-foreground transition-transform",
                sortOpen && "rotate-180"
              )}
            />
          </Button>

          {sortOpen ? (
            <div
              role="menu"
              className="absolute top-full right-0 z-50 mt-1 min-w-[7.5rem] rounded-lg border border-border bg-popover p-1 shadow-md"
            >
              {SORT_OPTIONS.map((option) => {
                const isActive = sort === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={isActive}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-muted/60"
                    )}
                    onClick={() => handleSortSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "size-3.5 shrink-0",
                        isActive ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>

        <PdfUploadButton onUpload={onUpload} isUploading={isUploading} />
      </div>
    </header>
  )
}
