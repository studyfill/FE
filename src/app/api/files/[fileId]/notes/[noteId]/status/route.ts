// GET /api/files/[fileId]/notes/[noteId]/status — 노트 생성 상태 폴링 프록시
import type { NextRequest } from "next/server"

import { backendProxy } from "@/lib/api/bff-proxy"

type RouteContext = { params: Promise<{ fileId: string; noteId: string }> }

export const GET = async (
  _request: NextRequest,
  { params }: RouteContext,
): Promise<Response> => {
  const { fileId, noteId } = await params
  return backendProxy(`/files/${fileId}/notes/${noteId}/status`, {
    method: "GET",
  })
}
