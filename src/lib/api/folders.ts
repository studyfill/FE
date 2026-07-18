// 폴더(folders) 백엔드 연동. BFF 라우트(src/app/api/folders/**)를 통해 same-origin 으로 호출한다.
// (백엔드 직접 호출이 아니므로 apiFetch 가 아닌 bffFetch 사용 — 토큰은 서버 세션 쿠키에서만 읽힘)
// 백엔드 favorite 은 folder_favorites 조인 테이블로 영속되며 PATCH .../favorite 는 토글이다.
import { bffFetch } from "./client"
import type {
  FolderCreateRequest,
  FolderDeletePreviewResponse,
  FolderDetailResponse,
  FolderMoveRequest,
  FolderResponse,
  FolderUpdateRequest,
} from "./types"
import {
  DEFAULT_FOLDER_COLOR,
  isFolderColorId,
  type FolderColorId,
} from "@/constants/folder-colors"
import { UNASSIGNED_FOLDER_LABEL } from "@/constants/folder"
import type { Folder, FolderListItem, FolderTreeNode } from "@/types/user-file"

const toColorId = (color?: string): FolderColorId =>
  color && isFolderColorId(color) ? color : DEFAULT_FOLDER_COLOR

export const mapFolderResponse = (
  f: FolderResponse | FolderDetailResponse
): Folder => ({
  id: f.id ?? "",
  name: f.name ?? "제목 없는 폴더",
  parentId: f.parentId ?? null,
  color: toColorId(f.color),
  favorite: f.favorite ?? false,
})

const toListItem = (f: FolderResponse): FolderListItem => ({
  ...mapFolderResponse(f),
  fileCount: f.fileCount ?? 0,
})

const compareFavoriteThenName = (a: Folder, b: Folder): number => {
  if (a.favorite && !b.favorite) return -1
  if (!a.favorite && b.favorite) return 1
  return a.name.localeCompare(b.name, "ko")
}

// ── 폴더 캐시 (id → folder) ──────────────────────────────────────
// 파일 카드/정렬/브레드크럼 등에서 folderId 로 이름·색을 동기 조회하기 위한 클라이언트 캐시.
// 트리/자식/즐겨찾기/조상 조회가 성공할 때마다 채워진다. (mock 스토어를 대체)
type CachedFolder = Folder & { fileCount?: number }
const folderCache = new Map<string, CachedFolder>()

const primeCache = (items: CachedFolder[]): void => {
  for (const f of items) if (f.id) folderCache.set(f.id, f)
}

export const getCachedFolder = (
  folderId: string | null | undefined
): CachedFolder | undefined =>
  folderId ? folderCache.get(folderId) : undefined

export const getCachedFolderList = (): Folder[] =>
  Array.from(folderCache.values())

export const getFolderName = (folderId: string | null): string => {
  if (!folderId) return UNASSIGNED_FOLDER_LABEL
  return folderCache.get(folderId)?.name ?? "알 수 없음"
}

export const getCachedFolderColorId = (
  folderId: string | null
): FolderColorId | null => {
  if (!folderId) return null
  return folderCache.get(folderId)?.color ?? null
}

// ── 저수준 API ───────────────────────────────────────────────────
const listRootFolders = (): Promise<FolderResponse[]> =>
  bffFetch<FolderResponse[]>("/folders")

const getFolderDetail = (folderId: string): Promise<FolderDetailResponse> =>
  bffFetch<FolderDetailResponse>(`/folders/${folderId}`)

export const createFolder = (
  name: string,
  color: FolderColorId,
  parentId: string | null = null
): Promise<FolderResponse> =>
  bffFetch<FolderResponse>("/folders", {
    method: "POST",
    body: {
      name,
      color,
      ...(parentId ? { parentId } : {}),
    } satisfies FolderCreateRequest,
  })

export const renameFolder = (
  folderId: string,
  name: string,
  color?: FolderColorId
): Promise<FolderResponse> =>
  bffFetch<FolderResponse>(`/folders/${folderId}`, {
    method: "PUT",
    body: { name, ...(color ? { color } : {}) } satisfies FolderUpdateRequest,
  })

export const moveFolder = (
  folderId: string,
  targetParentId: string | null
): Promise<FolderResponse> =>
  bffFetch<FolderResponse>(`/folders/${folderId}/move`, {
    method: "PATCH",
    body: {
      ...(targetParentId ? { targetParentId } : {}),
    } satisfies FolderMoveRequest,
  })

export const toggleFolderFavorite = (
  folderId: string
): Promise<FolderResponse> =>
  bffFetch<FolderResponse>(`/folders/${folderId}/favorite`, { method: "PATCH" })

export const deleteFolder = (folderId: string): Promise<void> =>
  bffFetch<void>(`/folders/${folderId}`, { method: "DELETE" })

export const getFolderDeletePreview = (
  folderId: string
): Promise<FolderDeletePreviewResponse> =>
  bffFetch<FolderDeletePreviewResponse>(`/folders/${folderId}/delete-preview`)

// ── 즐겨찾기 목록 (사이드바 상단 섹션) ───────────────────────────
export const listFavoriteFolders = async (): Promise<FolderListItem[]> => {
  const items = await bffFetch<FolderResponse[]>("/folders/favorites")
  const mapped = items.map(toListItem)
  primeCache(mapped)
  return mapped
}

// ── 직속 자식 폴더 (본문 그리드/리스트) ──────────────────────────
export const listChildFolders = async (
  parentId: string | null
): Promise<FolderListItem[]> => {
  const items = parentId
    ? ((await getFolderDetail(parentId)).subFolders ?? [])
    : await listRootFolders()
  const mapped = items.map(toListItem)
  primeCache(mapped)
  return [...mapped].sort(compareFavoriteThenName)
}

// ── 전체 트리 (사이드바) : 루트 → 자식 재귀 로드 ─────────────────
const buildTreeNode = async (f: FolderResponse): Promise<FolderTreeNode> => {
  const detail = await getFolderDetail(f.id ?? "")
  const childResponses = detail.subFolders ?? []
  const children = (await Promise.all(childResponses.map(buildTreeNode))).sort(
    compareFavoriteThenName
  )
  return { ...mapFolderResponse(f), fileCount: f.fileCount ?? 0, children }
}

const primeCacheFromTree = (nodes: FolderTreeNode[]): void => {
  for (const node of nodes) {
    primeCache([
      {
        id: node.id,
        name: node.name,
        parentId: node.parentId,
        color: node.color,
        favorite: node.favorite,
        fileCount: node.fileCount,
      },
    ])
    primeCacheFromTree(node.children)
  }
}

export const fetchFolderTree = async (): Promise<FolderTreeNode[]> => {
  const roots = await listRootFolders()
  const tree = (await Promise.all(roots.map(buildTreeNode))).sort(
    compareFavoriteThenName
  )
  primeCacheFromTree(tree)
  return tree
}

// ── 조상 경로 (브레드크럼) : 캐시 미스 시 백엔드로 상위 walk ──────
export const fetchFolderAncestorPath = async (
  folderId: string | null
): Promise<Folder[]> => {
  if (!folderId) return []

  const path: Folder[] = []
  const guard = new Set<string>()
  let currentId: string | null = folderId

  while (currentId && !guard.has(currentId)) {
    guard.add(currentId)
    const detail = await getFolderDetail(currentId)
    const folder = mapFolderResponse(detail)
    path.unshift(folder)
    primeCache([folder])
    currentId = detail.parentId ?? null
  }

  return path
}
