import Link from "next/link"
import { Layers } from "lucide-react"

import { APP_NAME } from "@/constants"
import { ROUTES } from "@/constants/routes"
import { LANDING_FOOTER_LINKS } from "@/features/landing/constants/landing-content"

export const LandingFooter = () => {
  return (
    <footer className="bg-[oklch(0.15_0.01_80)] px-4 py-14 text-background/70">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href={ROUTES.home} className="flex items-center gap-2.5">
            <span
              className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              aria-hidden
            >
              <Layers className="size-icon-md" strokeWidth={2.25} />
            </span>
            <span className="text-body font-semibold text-background">
              {APP_NAME}
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-body-sm leading-relaxed text-background/55">
            PDF 한 장으로 강의 노트를 완성하고, 빈칸으로 확실하게 외우세요.
          </p>
        </div>

        <div>
          <p className="text-body-sm font-semibold text-background">제품</p>
          <ul className="mt-4 space-y-2.5">
            {LANDING_FOOTER_LINKS.product.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-body-sm text-background/55 transition-colors hover:text-background"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-body-sm font-semibold text-background">회사</p>
          <ul className="mt-4 space-y-2.5">
            {LANDING_FOOTER_LINKS.company.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-body-sm text-background/55 transition-colors hover:text-background"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-body-sm font-semibold text-background">법적 고지</p>
          <ul className="mt-4 space-y-2.5">
            {LANDING_FOOTER_LINKS.legal.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-body-sm text-background/55 transition-colors hover:text-background"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
