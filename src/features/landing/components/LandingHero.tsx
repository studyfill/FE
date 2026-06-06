"use client"

import { Button } from "@/components/ui/button"
import { useEnterGuestMode } from "@/features/auth/hooks/useEnterGuestMode"

export const LandingHero = () => {
  const { enterGuestMode, isPending } = useEnterGuestMode()

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-landing-hero-from via-landing-hero-to to-background px-4 pb-24 pt-16">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,oklch(0.94_0.05_155/0.35),transparent_70%)]"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-4 py-1.5 text-caption font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden />
          아카이브 · AI 노트 · 빈칸 암기, 한 곳에서
        </div>

        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-primary md:text-5xl">
          PDF를 올리면,
          <br />
          나만의 노트가 된다
        </h1>

        <p className="mt-5 max-w-xl text-body leading-relaxed text-muted-foreground">
          자료를 올리고, AI 설명 위에 직접 편집하세요.
          <br />
          원문에서 빈칸을 뚫어 확실하게 외웁니다.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            size="lg"
            className="rounded-button px-6"
            onClick={enterGuestMode}
            disabled={isPending}
          >
            {isPending ? "이동 중…" : "무료로 시작하기"}
          </Button>
          <a href="#features">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="rounded-button border-primary/20 bg-background/80 px-6 hover:bg-background"
            >
              기능 살펴보기
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}
