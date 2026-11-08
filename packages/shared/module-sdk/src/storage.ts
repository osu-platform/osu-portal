/**
 * Storage helpers shared by both SDK implementations.
 */

import type { SdkStorage } from "./types"

/** Wraps a storage so every key is namespaced — modules cannot collide. */
export function namespaceStorage(
  storage: SdkStorage,
  namespace: string
): SdkStorage {
  const key = (k: string) => `${namespace}:${k}`
  return {
    get: (k) => storage.get(key(k)),
    set: (k, v) => storage.set(key(k), v),
    remove: (k) => storage.remove(key(k)),
  }
}

/** localStorage-backed storage, used when no platform storage is available. */
export function createLocalStorage(): SdkStorage {
  return {
    async get(key) {
      try {
        return localStorage.getItem(key)
      } catch {
        return null
      }
    },
    async set(key, value) {
      try {
        localStorage.setItem(key, value)
      } catch {
        /* quota or privacy mode — storage is best-effort */
      }
    },
    async remove(key) {
      try {
        localStorage.removeItem(key)
      } catch {
        /* see above */
      }
    },
  }
}

/** In-memory storage — the default for mocks and tests. */
export function createMemoryStorage(
  initial: Record<string, string> = {}
): SdkStorage {
  const map = new Map(Object.entries(initial))
  return {
    async get(key) {
      return map.has(key) ? map.get(key)! : null
    },
    async set(key, value) {
      map.set(key, value)
    },
    async remove(key) {
      map.delete(key)
    },
  }
}
