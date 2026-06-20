// 라이브러리 검색 API 호출. GET /api/v1/search?q=&type=ALL|FOLDER|FILE
// 응답: { folders: [{id,name,path}], files: [{id,name,path,fileType}] }

import { api } from "./client"
import type { SearchResponse } from "./types"

export type SearchType = "ALL" | "FOLDER" | "FILE"

/** 폴더명/파일명 기준 라이브러리 전역 검색. 빈 질의는 호출하지 않는다. */
export const searchLibrary = (
  query: string,
  type: SearchType = "ALL",
): Promise<SearchResponse> => {
  const params = new URLSearchParams({ q: query, type })
  return api.get<SearchResponse>(`/search?${params.toString()}`)
}
