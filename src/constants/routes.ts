export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  dashboardFolder: (folderId: string) => `/dashboard/${folderId}`,
  /** @deprecated Use ROUTES.dashboard — redirects for compatibility */
  materials: "/materials",
  /** @deprecated Use ROUTES.dashboardFolder */
  materialsFolder: (folderId: string) => `/materials/${folderId}`,
  study: (id: string) => `/study/${id}`,
  studyExplanation: (id: string) => `/study/${id}/explanation`,
  studyBlankStudy: (id: string) => `/study/${id}/blank-study`,
} as const

export const PROTECTED_PREFIXES = ["/dashboard", "/materials", "/study"]
