import { Sun } from "lucide-react"

import { cn } from "@/lib/utils"

type NoteGenerateIconProps = {
  className?: string
  size?: number
  strokeWidth?: number
}

export const NoteGenerateIcon = ({
  className,
  size = 18,
  strokeWidth = 2,
}: NoteGenerateIconProps) => (
  <Sun
    className={cn("shrink-0", className)}
    size={size}
    strokeWidth={strokeWidth}
    aria-hidden
  />
)
