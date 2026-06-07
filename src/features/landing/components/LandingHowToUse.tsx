import { Copy, FolderOpen, PencilLine } from "lucide-react"

import { LANDING_HOW_TO_STEPS } from "@/features/landing/constants/landing-content"
import { cn } from "@/lib/utils"

const STEP_ICONS = [FolderOpen, PencilLine, Copy] as const

export const LandingHowToUse = () => {
  return (
    <section
      id="how-to"
      className="scroll-mt-14 bg-[oklch(0.18_0.01_80)] px-4 py-20 text-background"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-body-sm font-semibold text-primary">이용 방법</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            3단계면 충분해요
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-body text-background/70">
            복잡한 세팅 없이, PDF 하나로 바로 시작하세요.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {LANDING_HOW_TO_STEPS.map((step, index) => {
            const Icon = STEP_ICONS[index]

            return (
              <div
                key={step.step}
                className="rounded-2xl border border-background/10 bg-background/5 p-6"
              >
                <div
                  className={cn(
                    "mb-5 flex size-10 items-center justify-center rounded-xl",
                    step.iconBg
                  )}
                >
                  <Icon
                    className={cn("size-icon-md", step.iconColor)}
                    strokeWidth={2}
                    aria-hidden
                  />
                </div>
                <p className={cn("text-body-sm font-semibold", step.iconColor)}>
                  {step.step}
                </p>
                <h3 className="mt-2 text-lg font-bold text-background">
                  {step.title}
                </h3>
                <p className="mt-2 text-body-sm leading-relaxed text-background/65">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
