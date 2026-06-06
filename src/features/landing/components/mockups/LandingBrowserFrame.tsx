import type { ReactNode } from "react"

type LandingBrowserFrameProps = {
  children: ReactNode
}

export const LandingBrowserFrame = ({ children }: LandingBrowserFrameProps) => {
  return (
    <div className="rounded-3xl bg-landing-panel/60 p-3 sm:p-5">
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-background shadow-2xl shadow-primary/8">
        <div className="flex items-center gap-2 border-b border-border/50 bg-landing-surface px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-rose-400/90" aria-hidden />
          <span className="size-2.5 rounded-full bg-amber-400/90" aria-hidden />
          <span className="size-2.5 rounded-full bg-emerald-400/90" aria-hidden />
        </div>
        <div className="pointer-events-none select-none">{children}</div>
      </div>
    </div>
  )
}
