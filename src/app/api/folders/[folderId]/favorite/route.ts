// PATCH /api/folders/[folderId]/favorite — 즐겨찾기 토글 프록시 (요청 본문 없음)
import type { NextRequest } from "next/server"

import { backendProxy } from "@/lib/api/bff-proxy"

type RouteContext = { params: Promise<{ folderId: string }> }

export const PATCH = async (
  _request: NextRequest,
  { params }: RouteContext,
): Promise<Response> => {
  const { folderId } = await params
  return backendProxy(`/folders/${folderId}/favorite`, { method: "PATCH" })
}
