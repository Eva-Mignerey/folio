const DB_NAME = 'folio'
const DB_VERSION = 1
const STORE = 'images'
const MAX_SIDE = 2000
const COMPRESS_ABOVE = 1_500_000

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
export const MAX_FILE_SIZE = 20_000_000

const urlCache = new Map<string, string>()
let dbPromise: Promise<IDBDatabase> | null = null
let persistenceAsked = false

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE)
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => {
        dbPromise = null
        reject(request.error)
      }
    })
  }
  return dbPromise
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, mode)
    const request = action(transaction.objectStore(STORE))
    transaction.oncomplete = () => resolve(request.result)
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

export function checkImageFile(file: Blob): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Format non pris en charge (JPEG, PNG, WebP, GIF ou AVIF).'
  if (file.size > MAX_FILE_SIZE) return 'Image trop lourde (20 Mo maximum).'
  return null
}

async function compress(file: Blob): Promise<Blob> {
  if (file.type === 'image/gif') return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    if (scale === 1 && file.size <= COMPRESS_ABOVE) {
      bitmap.close()
      return file
    }
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const output = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', 0.85))
    return output && output.size < file.size ? output : file
  } catch {
    return file
  }
}

function askPersistence(): void {
  if (persistenceAsked) return
  persistenceAsked = true
  navigator.storage?.persist?.().catch(() => undefined)
}

export async function saveImage(file: Blob): Promise<string> {
  const problem = checkImageFile(file)
  if (problem) throw new Error(problem)
  const blob = await compress(file)
  const id = crypto.randomUUID()
  try {
    await run('readwrite', store => store.put(blob, id))
  } catch {
    throw new Error('Impossible d’enregistrer l’image : le stockage du navigateur est peut-être plein.')
  }
  askPersistence()
  return id
}

export async function getImageUrl(id: string): Promise<string | null> {
  const cached = urlCache.get(id)
  if (cached) return cached
  try {
    const blob = await run<Blob | undefined>('readonly', store => store.get(id))
    if (!(blob instanceof Blob)) return null
    const url = URL.createObjectURL(blob)
    urlCache.set(id, url)
    return url
  } catch {
    return null
  }
}

export async function deleteImage(id: string): Promise<void> {
  const cached = urlCache.get(id)
  if (cached) {
    URL.revokeObjectURL(cached)
    urlCache.delete(id)
  }
  try {
    await run('readwrite', store => store.delete(id))
  } catch {
    return
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export async function getImageDataUrl(id: string): Promise<string | null> {
  try {
    const blob = await run<Blob | undefined>('readonly', store => store.get(id))
    return blob instanceof Blob ? await blobToDataUrl(blob) : null
  } catch {
    return null
  }
}

export function isImageDataUrl(value: unknown): value is string {
  return typeof value === 'string' && /^data:image\/(jpeg|png|webp|gif|avif);base64,/.test(value)
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl)
  return response.blob()
}