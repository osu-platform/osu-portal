/**
 * Default Storage Adapter
 *
 * Uses browser localStorage.
 * Simple and reliable for all web-based hosts.
 */

import type { StorageAdapter } from "../base"

/**
 * Creates default storage adapter using localStorage
 */
export const createDefaultStorageAdapter = (): StorageAdapter => ({
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const value = localStorage.getItem(key)
      if (!value) return null
      return JSON.parse(value) as T
    } catch (error) {
      console.error(`Storage.get error for key "${key}":`, error)
      return null
    }
  },

  set: async (key: string, value: unknown): Promise<void> => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Storage.set error for key "${key}":`, error)
    }
  },

  remove: async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Storage.remove error for key "${key}":`, error)
    }
  },

  clear: async (): Promise<void> => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error("Storage.clear error:", error)
    }
  },
})
