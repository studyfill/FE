// GET /api/files/[fileId]/notes — 노트 목록 프록시 (백엔드 GET /api/v1/files/{fileId}/notes)
import type { NextRequest } from "next/server"

import { backendProxy } from "@/lib/api/bff-proxy"

type RouteContext = { params: Promise<{ fileId: string }> }

export const GET = async (
  _request: NextRequest,
  { params }: RouteContext,
): Promise<Response> => {
  const { fileId } = await params
  return backendProxy(`/files/${fileId}/notes`, { method: "GET" })
}
