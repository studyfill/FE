// PATCH /api/files/[fileId]/move — 자료 폴더 이동 프록시
import type { NextRequest } from "next/server"

import { backendProxy, getSessionToken, unauthorized } from "@/lib/api/bff-proxy"

type RouteContext = { params: Promise<{ fileId: string }> }

export const PATCH = async (
  request: NextRequest,
  { params }: RouteContext,
): Promise<Response> => {
  const token = await getSessionToken()
  if (!token) return unauthorized()
  const { fileId } = await params
  const jsonBody = await request.json().catch(() => ({}))
  return backendProxy(`/files/${fileId}/move`, {
    method: "PATCH",
    token,
    jsonBody,
  })
}
