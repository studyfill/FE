import type { UserFilePdfPage } from "@/types/pdf-text"

type StaticPdfPaneProps = {
  pages: UserFilePdfPage[]
}

export const StaticPdfPane = ({ pages }: StaticPdfPaneProps) => {
  return (
    <div className="h-full overflow-y-auto bg-landing-surface/80 p-4">
      <div className="flex flex-col gap-3">
        {pages.slice(0, 2).map((page) => (
          <div
            key={page.pageNumber}
            className="rounded-xl border border-border/50 bg-background p-4 shadow-sm"
          >
            <p className="mb-2 text-caption font-medium text-muted-foreground">
              p.{page.pageNumber}
            </p>
            <p className="text-body-sm leading-relaxed text-foreground/80">
              {page.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
