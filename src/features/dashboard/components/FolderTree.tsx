"use client"

import Link from "next/link"
import { ChevronDown, ChevronRight, Folder, Pin } from "lucide-react"
import { useEffect, useState } from "react"

import { ROUTES } from "@/constants/routes"
import { getFolderIconClassName } from "@/lib/utils/folder-theme"
import { cn } from "@/lib/utils"
import type { FolderTreeNode } from "@/types/material"

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

type FolderTreeItemProps = {
  node: FolderTreeNode
  activeFolderId: string | null
  depth?: number
}

const FolderTreeItem = ({
  node,
  activeFolderId,
  depth = 0,
}: FolderTreeItemProps) => {
  const hasChildren = node.children.length > 0
  const isActive = activeFolderId === node.id
  const shouldExpand =
    hasChildren &&
    (depth === 0 || containsActiveFolder(node, activeFolderId))

  const [expanded, setExpanded] = useState(shouldExpand)

  useEffect(() => {
    if (containsActiveFolder(node, activeFolderId)) {
      setExpanded(true)
    }
  }, [activeFolderId, node.id, node.children.length])

  return (
    <li>
      <div
        className="flex items-center"
        style={{ paddingLeft: depth * 14 }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            onClick={() => setExpanded((v) => !v)}
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
        <Link
          href={ROUTES.dashboardFolder(node.id)}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-[15px] transition-colors",
            isActive
              ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
          )}
        >
          <Folder
            className={cn(
              "size-4 shrink-0",
              isActive ? "text-primary" : getFolderIconClassName(node.name)
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
          <span className="ml-auto shrink-0 text-[13px] tabular-nums text-muted-foreground">
            {node.materialCount}
          </span>
        </Link>
      </div>
      {hasChildren && expanded ? (
        <ul>
          {node.children.map((child) => (
            <FolderTreeItem
              key={child.id}
              node={child}
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
          activeFolderId={activeFolderId}
        />
      ))}
    </ul>
  )
}
