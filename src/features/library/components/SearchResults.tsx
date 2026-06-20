"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { FileText, Folder, Loader2, SearchX } from "lucide-react"

import { ROUTES } from "@/constants/routes"
import { useLibrarySearch } from "@/features/library/hooks/useLibrarySearch"

type SearchResultsProps = {
  query: string
}

const SearchSectionTitle = ({
  label,
  count,
}: {
  label: string
  count: number
}) => (
  <div className="flex items-center gap-2 px-0.5">
    <span className="text-caption font-medium text-muted-foreground">
      {label}
    </span>
    <span className="text-caption text-muted-foreground/70">{count}</span>
  </div>
)

const SearchResultRow = ({
  href,
  name,
  path,
  icon,
}: {
  href: string
  name: string
  path?: string
  icon: ReactNode
}) => (
  <Link
    href={href}
    className="flex items-center gap-3 rounded-lg border border-border/70 bg-card px-3 py-2.5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/70 text-muted-foreground">
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-body-sm font-medium text-foreground">
        {name}
      </span>
      {path ? (
        <span className="block truncate text-micro text-muted-foreground">
          {path}
        </span>
      ) : null}
    </span>
  </Link>
)

const SearchStatus = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/20 text-center">
    {children}
  </div>
)

export const SearchResults = ({ query }: SearchResultsProps) => {
  const { isLoading, error, results } = useLibrarySearch(query)

  if (isLoading) {
    return (
      <SearchStatus>
        <Loader2 className="size-6 animate-spin text-muted-foreground/50" aria-hidden />
        <p className="text-sm text-muted-foreground">검색 중…</p>
      </SearchStatus>
    )
  }

  if (error) {
    return (
      <SearchStatus>
        <SearchX className="size-8 text-muted-foreground/40" aria-hidden />
        <p className="text-sm font-medium text-foreground/80">{error}</p>
      </SearchStatus>
    )
  }

  const folders = results?.folders ?? []
  const files = results?.files ?? []
  const isEmpty = folders.length === 0 && files.length === 0

  if (isEmpty) {
    return (
      <SearchStatus>
        <SearchX className="size-8 text-muted-foreground/40" aria-hidden />
        <p className="text-sm font-medium text-foreground/80">
          “{query.trim()}”에 대한 결과가 없습니다
        </p>
        <p className="text-xs text-muted-foreground">
          다른 키워드로 검색해 보세요
        </p>
      </SearchStatus>
    )
  }

  return (
    <div className="space-y-5">
      {folders.length > 0 ? (
        <section className="space-y-2">
          <SearchSectionTitle label="폴더" count={folders.length} />
          <ul className="flex flex-col gap-2">
            {folders.map((folder) => (
              <li key={folder.id}>
                <SearchResultRow
                  href={ROUTES.libraryFolder(folder.id ?? "")}
                  name={folder.name ?? "이름 없는 폴더"}
                  path={folder.path}
                  icon={<Folder className="size-icon-md" strokeWidth={2} aria-hidden />}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {files.length > 0 ? (
        <section className="space-y-2">
          <SearchSectionTitle label="자료" count={files.length} />
          <ul className="flex flex-col gap-2">
            {files.map((file) => (
              <li key={file.id}>
                <SearchResultRow
                  href={ROUTES.study(file.id ?? "")}
                  name={file.name ?? "이름 없는 자료"}
                  path={file.path}
                  icon={<FileText className="size-icon-md" strokeWidth={2} aria-hidden />}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
