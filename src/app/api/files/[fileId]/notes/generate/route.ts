// POST /api/files/[fileId]/notes/generate — 노트 생성 요청 프록시
// (백엔드 POST /api/v1/files/{fileId}/notes/generate, 202 Accepted)
import type { NextRequest } from "next/server"

import { backendProxy } from "@/lib/api/bff-proxy"

type RouteContext = { params: Promise<{ fileId: string }> }

export const POST = async (
  request: NextRequest,
  { params }: RouteContext,
): Promise<Response> => {
  const { fileId } = await params
  const jsonBody = await request.json().catch(() => ({}))
  return backendProxy(`/files/${fileId}/notes/generate`, {
    method: "POST",
    jsonBody,
  })
}
