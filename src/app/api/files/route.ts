// GET /api/files — 자료 목록 프록시 (백엔드 GET /api/v1/files)
import type { NextRequest } from "next/server"

import { backendProxy } from "@/lib/api/bff-proxy"

export const GET = async (request: NextRequest): Promise<Response> => {
  const incoming = request.nextUrl.searchParams
  const search = new URLSearchParams()
  const folderId = incoming.get("folderId")
  if (folderId) search.set("folderId", folderId)
  search.set("page", incoming.get("page") ?? "0")
  search.set("size", incoming.get("size") ?? "100")
  for (const sort of incoming.getAll("sort")) search.append("sort", sort)

  return backendProxy("/files", { method: "GET", search })
}
