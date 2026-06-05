"use client"

import Link from "next/link"
import { useMemo } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ROUTES } from "@/constants/routes"
import { loadMockStore } from "@/lib/mocks/mock-store"
import { getFolderAncestorPath } from "@/lib/utils/folder-path"
import type { Material } from "@/types/material"

type StudyBreadcrumbsProps = {
  material: Material
}

export const StudyBreadcrumbs = ({ material }: StudyBreadcrumbsProps) => {
  const folderPath = useMemo(() => {
    const { folders } = loadMockStore()
    return getFolderAncestorPath(material.folderId, folders)
  }, [material.folderId])

  const displayName = material.name.replace(/\.pdf$/i, "")

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-sm">
        <BreadcrumbItem>
          <BreadcrumbLink
            render={<Link href={ROUTES.dashboard} />}
            className="text-muted-foreground hover:text-foreground"
          >
            라이브러리
          </BreadcrumbLink>
        </BreadcrumbItem>
        {folderPath.map((folder) => (
          <span key={folder.id} className="contents">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                render={<Link href={ROUTES.dashboardFolder(folder.id)} />}
                className="text-muted-foreground hover:text-foreground"
              >
                {folder.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </span>
        ))}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="max-w-[280px] truncate font-normal sm:max-w-md">
            {displayName}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
