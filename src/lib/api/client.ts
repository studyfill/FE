const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

type RequestOptions = RequestInit & {
  params?: Record<string, string>
}

export const apiClient = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { params, ...fetchOptions } = options
  const url = new URL(endpoint, API_URL)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  const response = await fetch(url.toString(), {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json() as Promise<T>
}
