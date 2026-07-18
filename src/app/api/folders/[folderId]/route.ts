// /api/folders/[folderId] — 상세 조회(GET)·이름/색 변경(PUT)·삭제(DELETE) 프록시
import type { NextRequest } from "next/server"

import { backendProxy } from "@/lib/api/bff-proxy"

type RouteContext = { params: Promise<{ folderId: string }> }

export const GET = async (
  _request: NextRequest,
  { params }: RouteContext,
): Promise<Response> => {
  const { folderId } = await params
  return backendProxy(`/folders/${folderId}`, { method: "GET" })
}

export const PUT = async (
  request: NextRequest,
  { params }: RouteContext,
): Promise<Response> => {
  const { folderId } = await params
  const jsonBody = await request.json().catch(() => ({}))
  return backendProxy(`/folders/${folderId}`, { method: "PUT", jsonBody })
}

export const DELETE = async (
  _request: NextRequest,
  { params }: RouteContext,
): Promise<Response> => {
  const { folderId } = await params
  return backendProxy(`/folders/${folderId}`, { method: "DELETE" })
}
