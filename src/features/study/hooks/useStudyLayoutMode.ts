"use client"

import { useEffect, useState } from "react"

export type StudyLayoutMode = "split" | "stacked"

const SPLIT_QUERY = "(min-width: 1024px)"

export const useStudyLayoutMode = (): StudyLayoutMode => {
  const [mode, setMode] = useState<StudyLayoutMode>("split")

  useEffect(() => {
    const media = window.matchMedia(SPLIT_QUERY)

    const update = () => {
      const isPortrait =
        window.matchMedia("(orientation: portrait)").matches ||
        window.innerHeight > window.innerWidth
      setMode(media.matches && !isPortrait ? "split" : "stacked")
    }

    update()
    media.addEventListener("change", update)
    window.addEventListener("resize", update)
    window.addEventListener("orientationchange", update)

    return () => {
      media.removeEventListener("change", update)
      window.removeEventListener("resize", update)
      window.removeEventListener("orientationchange", update)
    }
  }, [])

  return mode
}
