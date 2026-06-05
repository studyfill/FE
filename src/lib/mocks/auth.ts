import type { Session, User } from "@/types/auth"

import { loadMockStore, saveMockStore } from "./mock-store"

export const findUserByEmail = (email: string): User | undefined => {
  const store = loadMockStore()
  return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export const registerMockUser = (email: string, name: string): User => {
  const store = loadMockStore()
  const existing = findUserByEmail(email)
  if (existing) {
    return existing
  }

  const user: User = {
    id: `user-${Date.now()}`,
    email,
    name,
  }
  store.users.push(user)
  saveMockStore(store)
  return user
}

export const toSession = (user: User): Session => ({
  userId: user.id,
  email: user.email,
})
