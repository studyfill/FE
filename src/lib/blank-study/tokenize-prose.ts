export type ProseToken = {
  text: string
  isWord: boolean
  start: number
  end: number
}

export const PROSE_WORD_PATTERN =
  /[A-Za-z0-9][A-Za-z0-9()\-+⌊⌋₂]*|[가-힣]+/g

export const tokenizeProse = (text: string): ProseToken[] => {
  const tokens: ProseToken[] = []
  let lastIndex = 0

  for (const match of text.matchAll(PROSE_WORD_PATTERN)) {
    const start = match.index ?? 0
    const end = start + match[0].length

    if (start > lastIndex) {
      tokens.push({
        text: text.slice(lastIndex, start),
        isWord: false,
        start: lastIndex,
        end: start,
      })
    }

    tokens.push({
      text: match[0],
      isWord: true,
      start,
      end,
    })

    lastIndex = end
  }

  if (lastIndex < text.length) {
    tokens.push({
      text: text.slice(lastIndex),
      isWord: false,
      start: lastIndex,
      end: text.length,
    })
  }

  return tokens
}

export const splitTextAtToken = (
  text: string,
  start: number,
  end: number
): { before: string; word: string; after: string } => ({
  before: text.slice(0, start),
  word: text.slice(start, end),
  after: text.slice(end),
})
