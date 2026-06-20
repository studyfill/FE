const SPECIAL_CHARS_REGEX = /[^\p{L}\p{N}\s]/gu

export const normalizeAnswer = (input: string): string => {
  return input
    .trim()
    .toLowerCase()
    .replace(SPECIAL_CHARS_REGEX, "")
    .replace(/\s+/g, " ")
}

export const isBlankAnswerCorrect = (
  userAnswer: string,
  expectedAnswer: string
): boolean => {
  return normalizeAnswer(userAnswer) === normalizeAnswer(expectedAnswer)
}
