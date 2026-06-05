"use client"

import { cn } from "@/lib/utils"

type SegmentedOption<T extends string> = {
  value: T
  label: string
  description?: string
}

type SegmentedOptionGroupProps<T extends string> = {
  label: string
  value: T
  options: SegmentedOption<T>[]
  onChange: (value: T) => void
}

export const SegmentedOptionGroup = <T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedOptionGroupProps<T>) => {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-foreground">{label}</legend>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((option) => {
          const isSelected = option.value === value

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                isSelected
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <span className="font-medium">{option.label}</span>
              {option.description ? (
                <span className="mt-0.5 block text-xs opacity-80">
                  {option.description}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
