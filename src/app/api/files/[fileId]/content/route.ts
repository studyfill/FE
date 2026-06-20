// GET /api/files/[fileId]/content — 파일 원본 바이트 스트리밍 프록시.
// 백엔드 download-url(운영 presigned / 개발 스트리밍)을 서버에서 발급받아 same-origin 으로 중계한다.
// client 가 토큰/CORS 없이 blob 을 받도록 — study 로컬 하이드레이션(다른 기기 업로드 등)에 사용.
import type { NextRequest } from "next/server"

import { getServerSession } from "@/features/auth/session"
import { authedBackendFetch, isBackendUrl, unauthorized } from "@/lib/api/bff-proxy"
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
  const { fileId } = await params

  const urlRes = await authedBackendFetch(`/files/${fileId}/download-url`, {
    method: "GET",
  })
  if (!urlRes) return unauthorized()
  if (!urlRes.ok) return badGateway("다운로드 URL을 발급받지 못했습니다")

  const body = (await urlRes.json().catch(() => null)) as
    | { data?: FileDownloadResponse }
    | null
  const downloadUrl = body?.data?.url
  if (!downloadUrl) return badGateway("다운로드 URL을 발급받지 못했습니다")

  // 백엔드 origin 스트리밍 URL 이면 Bearer 첨부(갱신됐을 수 있어 세션 재조회), 외부 presigned 면 미첨부
  const token = isBackendUrl(downloadUrl)
    ? (await getServerSession())?.accessToken
    : undefined
  const fileRes = await fetch(downloadUrl, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
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
