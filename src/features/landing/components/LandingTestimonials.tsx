import { Star } from "lucide-react"

import { LANDING_TESTIMONIALS } from "@/features/landing/constants/landing-content"

export const LandingTestimonials = () => {
  return (
    <section className="bg-background px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-body-sm font-semibold text-primary">학생 후기</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            공부가 달라졌어요
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-body leading-relaxed text-muted-foreground">
            수험생부터 대학원생까지, 다양한 분들이 쓰고 있어요.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {LANDING_TESTIMONIALS.map((testimonial) => {
            const parts = testimonial.quote.split(testimonial.highlight)

            return (
              <article
                key={testimonial.id}
                className="flex flex-col rounded-2xl border border-border/60 bg-landing-surface/50 p-6 shadow-sm"
              >
                <div className="mb-4 flex gap-0.5" aria-label="5점 만점">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="size-3.5 fill-amber-400 text-amber-400"
                      aria-hidden
                    />
                  ))}
                </div>

                <p className="flex-1 text-body leading-relaxed text-foreground/90">
                  {parts[0]}
                  <strong className="font-semibold text-primary">
                    {testimonial.highlight}
                  </strong>
                  {parts[1]}
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <span
                    className={`flex size-9 items-center justify-center rounded-full text-body-sm font-semibold text-white ${testimonial.avatarColor}`}
                    aria-hidden
                  >
                    {testimonial.initial}
                  </span>
                  <div>
                    <p className="text-body-sm font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
