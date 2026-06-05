import { Sun } from "lucide-react"

import { cn } from "@/lib/utils"

type ExplanationGenerateIconProps = {
  className?: string
  size?: number
  strokeWidth?: number
}

export const ExplanationGenerateIcon = ({
  className,
  size = 18,
  strokeWidth = 2,
}: ExplanationGenerateIconProps) => (
  <Sun
    className={cn("shrink-0", className)}
    size={size}
    strokeWidth={strokeWidth}
    aria-hidden
  />
)
