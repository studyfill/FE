"use client"

import { cn } from "@/lib/utils"
import { tokenizeProse } from "@/lib/blank-study/tokenize-prose"

type BlankSelectableTextProps = {
  text: string
  enabled: boolean
  onWordClick: (tokenStart: number, tokenEnd: number) => void
}

export const BlankSelectableText = ({
  text,
  enabled,
  onWordClick,
}: BlankSelectableTextProps) => {
  if (!text) return null

  if (!enabled) {
    return <span className="inline align-baseline">{text}</span>
  }

  const tokens = tokenizeProse(text)

  return (
    <span className="inline align-baseline">
      {tokens.map((token, index) =>
        token.isWord ? (
          <button
            key={`${token.start}-${index}`}
            type="button"
            className={cn(
              "inline cursor-pointer rounded-sm px-0.5 align-baseline",
              "decoration-primary/40 decoration-2 underline-offset-[3px]",
              "hover:bg-primary/10 hover:underline hover:decoration-primary"
            )}
            onClick={(event) => {
              event.stopPropagation()
              onWordClick(token.start, token.end)
            }}
            aria-label={`"${token.text}" 빈칸으로 만들기`}
          >
            {token.text}
          </button>
        ) : (
          <span key={`${token.start}-${index}`}>{token.text}</span>
        )
      )}
    </span>
  )
}
