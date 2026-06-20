"use client"

import Link from "next/link"
import { useDraggable, useDroppable, useDndContext } from "@dnd-kit/core"
import { ChevronDown, ChevronRight, Folder, Pin } from "lucide-react"
import { useEffect, useMemo, useState, type PointerEvent } from "react"

import { ROUTES } from "@/constants/routes"
import {
  folderDragId,
  folderDropId,
  type LibraryDragData,
} from "@/features/library/types/dnd"
import { getFolderIconClassNameForColor } from "@/lib/utils/folder-theme"
import { cn } from "@/lib/utils"
import type { FolderTreeNode } from "@/types/user-file"

type FolderTreeProps = {
  nodes: FolderTreeNode[]
  activeFolderId: string | null
}

const containsActiveFolder = (
  node: FolderTreeNode,
  activeFolderId: string | null
): boolean => {
  if (!activeFolderId) return false
  if (node.id === activeFolderId) return true
  return node.children.some((child) =>
    containsActiveFolder(child, activeFolderId)
  )
}

const nodeContainsFolder = (
  node: FolderTreeNode,
  folderId: string
): boolean => {
  if (node.id === folderId) return true
  return node.children.some((child) => nodeContainsFolder(child, folderId))
}

const findNodeById = (
  nodes: FolderTreeNode[],
  folderId: string
): FolderTreeNode | null => {
  for (const node of nodes) {
    if (node.id === folderId) return node
    const found = findNodeById(node.children, folderId)
    if (found) return found
  }
  return null
}

const isInvalidFolderDrop = (
  dragData: LibraryDragData | undefined,
  targetNode: FolderTreeNode,
  allNodes: FolderTreeNode[]
): boolean => {
  if (!dragData || dragData.type !== "folder") return false
  if (dragData.folderId === targetNode.id) return true

  const draggedNode = findNodeById(allNodes, dragData.folderId)
  if (!draggedNode) return false

  return nodeContainsFolder(draggedNode, targetNode.id)
}

type FolderTreeItemProps = {
  node: FolderTreeNode
  allNodes: FolderTreeNode[]
  activeFolderId: string | null
  depth?: number
}

const FolderTreeItem = ({
  node,
  allNodes,
  activeFolderId,
  depth = 0,
}: FolderTreeItemProps) => {
  const hasChildren = node.children.length > 0
  const isActive = activeFolderId === node.id
  const shouldExpand =
    hasChildren &&
    (depth === 0 || containsActiveFolder(node, activeFolderId))

  const [expanded, setExpanded] = useState(shouldExpand)

  const { active } = useDndContext()
  const dragData = active?.data.current as LibraryDragData | undefined

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: folderDragId(node.id),
    data: {
      type: "folder",
      folderId: node.id,
      label: node.name,
    } satisfies LibraryDragData,
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: folderDropId(node.id),
  })

  const invalidDrop = useMemo(
    () => isInvalidFolderDrop(dragData, node, allNodes),
    [dragData, node, allNodes]
  )

  const showDropHighlight = isOver && dragData && !invalidDrop

  useEffect(() => {
    if (containsActiveFolder(node, activeFolderId)) {
      setExpanded(true)
    }
  }, [activeFolderId, node])

  const setRowRef = (element: HTMLDivElement | null) => {
    setDropRef(element)
  }

  const handleChevronPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation()
  }

  return (
    <li>
      <div
        ref={setRowRef}
        className={cn(
          "flex items-center rounded-lg transition-colors",
          isDragging && "opacity-40",
          showDropHighlight && "bg-primary/10 ring-2 ring-primary/35",
          isOver && invalidDrop && "bg-destructive/5 ring-2 ring-destructive/25"
        )}
        style={{ paddingLeft: depth * 14 }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            onClick={() => setExpanded((value) => !value)}
            onPointerDown={handleChevronPointerDown}
            aria-label={expanded ? "폴더 접기" : "폴더 펼치기"}
            aria-expanded={expanded}
          >
            {expanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>
        ) : (
          <span className="size-7 shrink-0" aria-hidden />
        )}

        <div
          ref={setDragRef}
          {...attributes}
          {...listeners}
          aria-label={`${node.name} 폴더 이동`}
          className="flex min-w-0 flex-1 cursor-grab active:cursor-grabbing"
        >
          <Link
            href={ROUTES.libraryFolder(node.id)}
            draggable={false}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-body transition-colors",
              isActive
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
            )}
          >
            <Folder
              className={cn(
                "size-4 shrink-0",
                isActive
                  ? "text-primary"
                  : getFolderIconClassNameForColor(node.color)
              )}
              aria-hidden
            />
            <span className="truncate">{node.name}</span>
            {node.pinned ? (
              <Pin
                className="size-3 shrink-0 fill-rose-500/15 text-rose-500"
                aria-label="고정됨"
              />
            ) : null}
            <span className="ml-auto shrink-0 text-caption tabular-nums text-muted-foreground">
              {node.fileCount}
            </span>
          </Link>
        </div>
      </div>

      {hasChildren && expanded ? (
        <ul>
          {node.children.map((child) => (
            <FolderTreeItem
              key={child.id}
              node={child}
              allNodes={allNodes}
              activeFolderId={activeFolderId}
              depth={depth + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export const FolderTree = ({ nodes, activeFolderId }: FolderTreeProps) => {
  return (
    <ul className="flex flex-col gap-0.5">
      {nodes.map((node) => (
        <FolderTreeItem
          key={node.id}
          node={node}
          allNodes={nodes}
          activeFolderId={activeFolderId}
        />
      ))}
    </ul>
  )
}
