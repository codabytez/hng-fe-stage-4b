import { openDB } from 'idb'
import type { StoredKeyMaterial } from '@/types/crypto'

const DB_NAME = 'whisperbox-keys'
const STORE_NAME = 'keys'
const KEY_ID = 'user-key-material'
const DB_VERSION = 1

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    },
  })
}

export async function storeKeyMaterial(material: StoredKeyMaterial): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, material, KEY_ID)
}

export async function loadKeyMaterial(): Promise<StoredKeyMaterial | null> {
  const db = await getDB()
  const result = await db.get(STORE_NAME, KEY_ID)
  return result ?? null
}

export async function clearKeyMaterial(): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, KEY_ID)
}

export async function hasKeyMaterial(): Promise<boolean> {
  const material = await loadKeyMaterial()
  return material !== null
}
