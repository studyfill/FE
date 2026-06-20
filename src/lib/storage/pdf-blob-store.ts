const DB_NAME = "studyfill-pdf-store"
const STORE_NAME = "pdfs"
const DB_VERSION = 1

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"))
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })

export const savePdfBlob = async (
  userFileId: string,
  data: ArrayBuffer
): Promise<void> => {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB write failed"))
    tx.objectStore(STORE_NAME).put(data, userFileId)
  })
  db.close()
}

export const getPdfBlob = async (
  userFileId: string
): Promise<ArrayBuffer | null> => {
  const db = await openDb()
  const result = await new Promise<ArrayBuffer | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const request = tx.objectStore(STORE_NAME).get(userFileId)
    request.onsuccess = () => resolve((request.result as ArrayBuffer) ?? null)
    request.onerror = () => reject(request.error ?? new Error("IndexedDB read failed"))
  })
  db.close()
  return result
}
