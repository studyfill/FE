// /api/folders — 루트 폴더 목록 조회(GET) · 폴더 생성(POST) 프록시
import type { NextRequest } from "next/server"

import { backendProxy } from "@/lib/api/bff-proxy"

export const GET = async (): Promise<Response> =>
  backendProxy("/folders", { method: "GET" })

export const POST = async (request: NextRequest): Promise<Response> => {
  const jsonBody = await request.json().catch(() => ({}))
  return backendProxy("/folders", { method: "POST", jsonBody })
}
