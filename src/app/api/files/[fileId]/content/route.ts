// GET /api/files/[fileId]/content — 파일 원본 바이트 스트리밍 프록시.
// 백엔드 download-url(운영 presigned / 개발 스트리밍)을 서버에서 발급받아 same-origin 으로 중계한다.
// client 가 토큰/CORS 없이 blob 을 받도록 — study 로컬 하이드레이션(다른 기기 업로드 등)에 사용.
import type { NextRequest } from "next/server"

import {
  backendJson,
  getSessionToken,
  isBackendUrl,
  unauthorized,
} from "@/lib/api/bff-proxy"
import type { FileDownloadResponse } from "@/lib/api/types"

type RouteContext = { params: Promise<{ fileId: string }> }

const badGateway = (message: string): Response =>
  Response.json(
    { success: false, data: null, code: "FILE_DOWNLOAD_FAILED", message },
    { status: 502 },
  )

export const GET = async (
  _request: NextRequest,
  { params }: RouteContext,
): Promise<Response> => {
  const token = await getSessionToken()
  if (!token) return unauthorized()
  const { fileId } = await params

  const download = await backendJson<FileDownloadResponse>(
    `/files/${fileId}/download-url`,
    token,
  ).catch(() => null)
  if (!download?.url) return badGateway("다운로드 URL을 발급받지 못했습니다")

  // 백엔드 origin 스트리밍 URL 이면 Bearer 첨부, 외부 presigned 면 미첨부
  const fileRes = await fetch(download.url, {
    headers: isBackendUrl(download.url)
      ? { Authorization: `Bearer ${token}` }
      : {},
  }).catch(() => null)
  if (!fileRes?.ok || !fileRes.body) {
    return badGateway("파일을 가져오지 못했습니다")
  }

  return new Response(fileRes.body, {
    status: 200,
    headers: {
      "Content-Type":
        fileRes.headers.get("Content-Type") ?? "application/octet-stream",
      "Cache-Control": "private, max-age=600",
    },
  })
}
