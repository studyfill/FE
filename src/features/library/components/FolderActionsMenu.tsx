"use client"

import { EllipsisVertical, FolderInput, Star, Trash2 } from "lucide-react"
import { useState } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLibraryContext } from "@/features/library/context/LibraryContext"
import { MoveFolderDialog } from "@/features/library/components/MoveFolderDialog"
import { DeleteFolderDialog } from "@/features/library/components/DeleteFolderDialog"
import { cn } from "@/lib/utils"
import type { FolderListItem } from "@/types/user-file"

type FolderActionsMenuProps = {
  folder: FolderListItem
  className?: string
}

export const FolderActionsMenu = ({
  folder,
  className,
}: FolderActionsMenuProps) => {
  const { handleToggleFavorite } = useLibraryContext()
  const [moveOpen, setMoveOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[popup-open]:bg-muted data-[popup-open]:text-foreground",
            className
          )}
          aria-label={`${folder.name} 폴더 작업`}
        >
          <EllipsisVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setMoveOpen(true)}>
            <FolderInput />
            폴더 이동
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void handleToggleFavorite(folder.id)}>
            <Star
              className={cn(folder.favorite && "fill-amber-400 text-amber-500")}
            />
            {folder.favorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 />
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <MoveFolderDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        folder={folder}
      />
      <DeleteFolderDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        folder={folder}
      />
    </>
  )
}
