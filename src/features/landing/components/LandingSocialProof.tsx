import { LANDING_UNIVERSITY_TAGS } from "@/features/landing/constants/landing-content"

export const LandingSocialProof = () => {
  return (
    <section className="border-y border-border/50 bg-landing-surface/60 px-4 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-4">
          <p className="text-3xl font-bold tracking-tight text-foreground">
            12,000+
          </p>
          <div className="h-10 w-px bg-border" aria-hidden />
          <p className="text-left text-body-sm text-muted-foreground">
            명이 함께
            <br />
            공부하고 있어요
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:items-end">
          <p className="text-caption font-medium text-muted-foreground">
            주로 이런 분들이 써요
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
            {LANDING_UNIVERSITY_TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/80 bg-background px-3 py-1 text-caption text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
