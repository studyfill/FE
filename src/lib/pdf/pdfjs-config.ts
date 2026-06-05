type PdfJsModule = typeof import("pdfjs-dist")

export const configurePdfJsWorker = (pdfjs: PdfJsModule) => {
  if (typeof window === "undefined") return
  if (pdfjs.GlobalWorkerOptions.workerSrc) return

  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
}

export const loadPdfJs = async () => {
  const pdfjs = await import("pdfjs-dist")
  configurePdfJsWorker(pdfjs)
  return pdfjs
}
