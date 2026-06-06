"use client"

import { cn } from "@/lib/utils"

type SegmentedOption<T extends string> = {
  value: T
  label: string
  sublabel?: string
}

type SegmentedOptionGroupProps<T extends string> = {
  label: string
  value: T
  options: SegmentedOption<T>[]
  onChange: (value: T) => void
  columns?: 2 | 3
}

export const SegmentedOptionGroup = <T extends string>({
  label,
  value,
  options,
  onChange,
  columns = 3,
}: SegmentedOptionGroupProps<T>) => {
  return (
    <div className="w-full space-y-2.5">
      <p className="text-body font-medium text-muted-foreground">{label}</p>
      <div
        className={cn(
          "grid w-full gap-2.5",
          columns === 2 ? "grid-cols-2" : "grid-cols-3"
        )}
        role="group"
        aria-label={label}
      >
        {options.map((option) => {
          const isSelected = option.value === value
          const hasSublabel = Boolean(option.sublabel)

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex w-full flex-col items-center justify-center rounded-button border px-2 text-center transition-colors",
                hasSublabel ? "h-icon-xl py-2" : "h-12",
                hasSublabel ? "text-sm leading-none" : "text-body-sm leading-tight",
                isSelected
                  ? "border-primary/45 bg-primary/[0.08] text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-border hover:bg-muted/15"
              )}
            >
              <span className={cn("px-0.5", isSelected && "font-semibold")}>
                {option.label}
              </span>
              {option.sublabel ? (
                <span
                  className={cn(
                    "mt-1 px-0.5 text-xs leading-none",
                    isSelected ? "font-medium text-primary/90" : "text-muted-foreground/90"
                  )}
                >
                  {option.sublabel}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
