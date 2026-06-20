// POST /api/files/upload — multipart 업로드 프록시 (백엔드 POST /api/v1/files/upload)
// folderId·name 은 폼 필드가 아니라 쿼리 파라미터로 전달한다.
import type { NextRequest } from "next/server"

import { backendProxy, getSessionToken, unauthorized } from "@/lib/api/bff-proxy"

export const POST = async (request: NextRequest): Promise<Response> => {
  const token = await getSessionToken()
  if (!token) return unauthorized()

  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File)) {
    return Response.json(
      { success: false, data: null, code: "COMMON_001", message: "파일이 필요합니다" },
      { status: 400 },
    )
  }

  const incoming = request.nextUrl.searchParams
  const search = new URLSearchParams()
  const folderId = incoming.get("folderId")
  const name = incoming.get("name")
  if (folderId) search.set("folderId", folderId)
  if (name) search.set("name", name)

  const forward = new FormData()
  forward.append("file", file)

  return backendProxy("/files/upload", {
    method: "POST",
    token,
    search,
    formBody: forward,
  })
}
