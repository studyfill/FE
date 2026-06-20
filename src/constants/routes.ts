export const ROUTES = {
  home: "/",
  library: "/library",
  libraryFolder: (folderId: string) => `/library/${folderId}`,
  study: (id: string) => `/study/${id}`,
  studyNote: (id: string) => `/study/${id}/note`,
  studyBlank: (id: string) => `/study/${id}/blank`,
} as const

/** @deprecated /library 로 redirect 되는 레거시 경로 (북마크 호환용) */
export const LEGACY_LIBRARY_PREFIXES = ["/dashboard", "/materials"] as const

export const PROTECTED_PREFIXES = ["/library", "/dashboard", "/materials", "/study"]
