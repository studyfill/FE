"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useEnterGuestMode } from "@/features/auth/hooks/useEnterGuestMode"
import { LANDING_PRICING_PLANS } from "@/features/landing/constants/landing-content"
import { cn } from "@/lib/utils"

export const LandingPricing = () => {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")
  const { enterGuestMode, isPending: isGuestPending } = useEnterGuestMode()

  return (
    <section
      id="pricing"
      className="scroll-mt-14 border-t border-border/50 bg-landing-panel/40 px-4 py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-body-sm font-semibold text-primary">요금제</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            필요한 만큼만 쓰세요
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-body text-muted-foreground">
            무료 플랜으로 시작하고, 필요할 때 업그레이드하세요.
          </p>

          <div className="mx-auto mt-8 inline-flex rounded-full border border-border bg-muted/50 p-1">
            <button
              type="button"
              className={cn(
                "rounded-full px-5 py-2 text-body-sm font-medium transition-colors",
                billing === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setBilling("monthly")}
            >
              월간
            </button>
            <button
              type="button"
              className={cn(
                "rounded-full px-5 py-2 text-body-sm font-medium transition-colors",
                billing === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setBilling("yearly")}
            >
              연간 20% 할인
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {LANDING_PRICING_PLANS.map((plan) => {
            const price =
              billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative flex flex-col gap-0 p-0 py-0 shadow-sm",
                  plan.popular && "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                )}
              >
                {plan.popular ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-caption font-medium text-primary-foreground">
                    가장 인기
                  </span>
                ) : null}

                <CardHeader className="gap-2 px-6 pt-8 pb-4">
                  <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {price}
                  </p>
                  <CardDescription className="text-body-sm">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col px-6 pb-8">
                  <ul className="flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature.text}
                        className="flex items-center gap-2.5 text-body-sm"
                      >
                        {feature.included ? (
                          <Check
                            className="size-icon-md shrink-0 text-primary"
                            strokeWidth={2.5}
                            aria-hidden
                          />
                        ) : (
                          <X
                            className="size-icon-md shrink-0 text-muted-foreground/50"
                            strokeWidth={2}
                            aria-hidden
                          />
                        )}
                        <span
                          className={
                            feature.included
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    type="button"
                    variant={
                      plan.variant === "outline"
                        ? "outline"
                        : plan.variant === "dark"
                          ? "secondary"
                          : "default"
                    }
                    className={cn(
                      "mt-8 w-full rounded-button",
                      plan.variant === "dark" &&
                        "bg-foreground text-background hover:bg-foreground/90"
                    )}
                    onClick={enterGuestMode}
                    disabled={isGuestPending}
                  >
                    {isGuestPending ? "이동 중…" : plan.cta}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <p className="mt-8 text-center text-caption text-muted-foreground">
          모든 플랜 · 결제 후 7일 이내 환불 보장
        </p>
      </div>
    </section>
  )
}
