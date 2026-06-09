export type User = {
  id: string
  email: string
  name: string
}

export type AuthProvider = "google" | "guest"

export type Session = {
  userId: string
  email: string
  provider?: AuthProvider
  isGuest?: boolean
  picture?: string
}
