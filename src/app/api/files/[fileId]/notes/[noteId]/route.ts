// /api/files/[fileId]/notes/[noteId] — 노트 상세 조회·편집 저장·삭제 프록시
import type { NextRequest } from "next/server"

import { backendProxy } from "@/lib/api/bff-proxy"

type RouteContext = { params: Promise<{ fileId: string; noteId: string }> }

export const GET = async (
  _request: NextRequest,
  { params }: RouteContext,
): Promise<Response> => {
  const { fileId, noteId } = await params
  return backendProxy(`/files/${fileId}/notes/${noteId}`, { method: "GET" })
}

export const PUT = async (
  request: NextRequest,
  { params }: RouteContext,
): Promise<Response> => {
  const { fileId, noteId } = await params
  const jsonBody = await request.json().catch(() => ({}))
  return backendProxy(`/files/${fileId}/notes/${noteId}`, {
    method: "PUT",
    jsonBody,
  })
}

export const DELETE = async (
  _request: NextRequest,
  { params }: RouteContext,
): Promise<Response> => {
  const { fileId, noteId } = await params
  return backendProxy(`/files/${fileId}/notes/${noteId}`, { method: "DELETE" })
}
