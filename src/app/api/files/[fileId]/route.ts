// /api/files/[fileId] — 단건 조회·이름변경·삭제 프록시
import type { NextRequest } from "next/server"

import { backendProxy } from "@/lib/api/bff-proxy"

type RouteContext = { params: Promise<{ fileId: string }> }

export const GET = async (
  _request: NextRequest,
  { params }: RouteContext,
): Promise<Response> => {
  const { fileId } = await params
  return backendProxy(`/files/${fileId}`, { method: "GET" })
}

export const PUT = async (
  request: NextRequest,
  { params }: RouteContext,
): Promise<Response> => {
  const { fileId } = await params
  const jsonBody = await request.json().catch(() => ({}))
  return backendProxy(`/files/${fileId}`, { method: "PUT", jsonBody })
}

export const DELETE = async (
  _request: NextRequest,
  { params }: RouteContext,
): Promise<Response> => {
  const { fileId } = await params
  return backendProxy(`/files/${fileId}`, { method: "DELETE" })
}
