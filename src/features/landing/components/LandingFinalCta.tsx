"use client"

import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useEnterGuestMode } from "@/features/auth/hooks/useEnterGuestMode"

export const LandingFinalCta = () => {
  const { enterGuestMode, isPending } = useEnterGuestMode()

  return (
    <section className="bg-primary px-4 py-20 text-primary-foreground">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          나만의 공부 공간을 지금 시작하세요
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-body text-primary-foreground/80">
          PDF 올리고, 편집하고, 원문에서 빈칸 뚫기. 공부의 모든 것을 한 곳에서.
        </p>
        <Button
          type="button"
          size="lg"
          variant="secondary"
          className="mt-8 rounded-full bg-background px-8 text-foreground hover:bg-background/90"
          onClick={enterGuestMode}
          disabled={isPending}
        >
          {isPending ? "이동 중…" : "무료로 시작하기"}
          <ArrowRight className="ml-1" aria-hidden />
        </Button>
      </div>
    </section>
  )
}
