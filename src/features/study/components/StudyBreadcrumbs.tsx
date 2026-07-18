"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ROUTES } from "@/constants/routes"
import { fetchFolderAncestorPath } from "@/lib/api/folders"
import type { Folder, UserFile } from "@/types/user-file"

type StudyBreadcrumbsProps = {
  userFile: UserFile
}

export const StudyBreadcrumbs = ({ userFile }: StudyBreadcrumbsProps) => {
  const [folderPath, setFolderPath] = useState<Folder[]>([])

  useEffect(() => {
    let active = true
    fetchFolderAncestorPath(userFile.folderId)
      .then((path) => {
        if (active) setFolderPath(path)
      })
      .catch(() => {
        if (active) setFolderPath([])
      })
    return () => {
      active = false
    }
  }, [userFile.folderId])

  const displayName = userFile.name.replace(/\.pdf$/i, "")

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-sm">
        <BreadcrumbItem>
          <BreadcrumbLink
            render={<Link href={ROUTES.library} />}
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
                render={<Link href={ROUTES.libraryFolder(folder.id)} />}
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
