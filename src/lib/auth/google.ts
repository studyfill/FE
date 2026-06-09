export type GoogleProfile = {
  sub: string
  email: string
  name: string
  picture?: string
}

/** Mock profile for Phase A when Google OAuth credentials are not configured. */
export const createMockGoogleProfile = (): GoogleProfile => ({
  sub: `google-mock-${Date.now()}`,
  email: "student@gmail.com",
  name: "Google User",
})

export const mapGoogleProfileToSession = (profile: GoogleProfile) => ({
  userId: profile.sub,
  email: profile.email,
  name: profile.name,
  provider: "google" as const,
  picture: profile.picture,
})
