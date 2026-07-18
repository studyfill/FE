// GET /api/folders/[folderId]/delete-preview — 삭제 시 함께 사라지는 하위 폴더/자료 수 프록시
import type { NextRequest } from "next/server"

import { backendProxy } from "@/lib/api/bff-proxy"

type RouteContext = { params: Promise<{ folderId: string }> }

export const GET = async (
  _request: NextRequest,
  { params }: RouteContext,
): Promise<Response> => {
  const { folderId } = await params
  return backendProxy(`/folders/${folderId}/delete-preview`, { method: "GET" })
}
