export type BlankItemStatus = "pending" | "correct" | "incorrect"

export type BlankItem = {
  id: string
  materialId: string
  sentenceBefore: string
  sentenceAfter: string
  answer: string
  hint: string
  status: BlankItemStatus
}
