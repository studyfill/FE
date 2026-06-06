import type { ReactNode } from "react"
import { Check, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

type LandingFeatureSectionProps = {
  label: string
  title: string
  description: string
  bullets: readonly string[]
  mockup: ReactNode
  tone?: "default" | "muted"
}

export const LandingFeatureSection = ({
  label,
  title,
  description,
  bullets,
  mockup,
  tone = "default",
}: LandingFeatureSectionProps) => {
  return (
    <section
      className={cn(
        "px-4 py-20",
        tone === "muted" ? "bg-landing-surface" : "bg-background"
      )}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-primary">
            <Sparkles className="size-3.5" aria-hidden />
            {label}
          </p>
          <h3 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {title}
          </h3>
          <p className="mt-4 text-body leading-relaxed text-muted-foreground">
            {description}
          </p>
          <ul className="mx-auto mt-8 grid max-w-xl grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-2 text-left text-body-sm text-foreground"
              >
                <Check
                  className="mt-0.5 size-icon-md shrink-0 text-primary"
                  strokeWidth={2.5}
                  aria-hidden
                />
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14">{mockup}</div>
      </div>
    </section>
  )
}
