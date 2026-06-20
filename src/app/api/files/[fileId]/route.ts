// /api/files/[fileId] — 단건 조회·이름변경·삭제 프록시
import type { NextRequest } from "next/server"

import { backendProxy, getSessionToken, unauthorized } from "@/lib/api/bff-proxy"

type RouteContext = { params: Promise<{ fileId: string }> }

export const GET = async (
  _request: NextRequest,
  { params }: RouteContext,
): Promise<Response> => {
  const token = await getSessionToken()
  if (!token) return unauthorized()
  const { fileId } = await params
  return backendProxy(`/files/${fileId}`, { method: "GET", token })
}

export const PUT = async (
  request: NextRequest,
  { params }: RouteContext,
): Promise<Response> => {
  const token = await getSessionToken()
  if (!token) return unauthorized()
  const { fileId } = await params
  const jsonBody = await request.json().catch(() => ({}))
  return backendProxy(`/files/${fileId}`, { method: "PUT", token, jsonBody })
}

export const DELETE = async (
  _request: NextRequest,
  { params }: RouteContext,
): Promise<Response> => {
  const token = await getSessionToken()
  if (!token) return unauthorized()
  const { fileId } = await params
  return backendProxy(`/files/${fileId}`, { method: "DELETE", token })
}
