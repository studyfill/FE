// PATCH /api/folders/[folderId]/move — 폴더 이동 프록시
import type { NextRequest } from "next/server"

import { backendProxy } from "@/lib/api/bff-proxy"

type RouteContext = { params: Promise<{ folderId: string }> }

export const PATCH = async (
  request: NextRequest,
  { params }: RouteContext,
): Promise<Response> => {
  const { folderId } = await params
  const jsonBody = await request.json().catch(() => ({}))
  return backendProxy(`/folders/${folderId}/move`, {
    method: "PATCH",
    jsonBody,
  })
}
