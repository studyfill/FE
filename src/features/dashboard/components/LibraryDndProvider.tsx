"use client"

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { snapCenterToCursor } from "@dnd-kit/modifiers"
import { FileText, Folder } from "lucide-react"
import { useState, type ReactNode } from "react"

import { useDashboardLibraryContext } from "@/features/dashboard/context/DashboardLibraryContext"
import {
  parseFolderDropId,
  type LibraryDragData,
} from "@/features/dashboard/types/dnd"

type LibraryDndProviderProps = {
  children: ReactNode
}

export const LibraryDndProvider = ({ children }: LibraryDndProviderProps) => {
  const { handleMoveMaterial, handleMoveFolder } = useDashboardLibraryContext()
  const [activeDrag, setActiveDrag] = useState<LibraryDragData | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as LibraryDragData | undefined
    if (data) setActiveDrag(data)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null)

    const { active, over } = event
    if (!over) return

    const targetFolderId = parseFolderDropId(over.id)
    if (!targetFolderId) return

    const data = active.data.current as LibraryDragData | undefined
    if (!data) return

    if (data.type === "material") {
      handleMoveMaterial(data.materialId, targetFolderId)
      return
    }

    handleMoveFolder(data.folderId, targetFolderId)
  }

  const handleDragCancel = () => {
    setActiveDrag(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
        {activeDrag ? (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
            {activeDrag.type === "material" ? (
              <FileText className="size-4 shrink-0 text-muted-foreground" />
            ) : (
              <Folder className="size-4 shrink-0 text-primary" />
            )}
            <span className="max-w-[200px] truncate font-medium">
              {activeDrag.label}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
