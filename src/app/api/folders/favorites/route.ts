// GET /api/folders/favorites — 즐겨찾기 폴더 목록 프록시
import { backendProxy } from "@/lib/api/bff-proxy"

export const GET = async (): Promise<Response> =>
  backendProxy("/folders/favorites", { method: "GET" })
