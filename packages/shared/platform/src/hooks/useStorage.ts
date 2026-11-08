/**
 * useStorage Hook
 *
 * Persistent data storage operations
 */

import { useRuntime } from "./useRuntime"

/**
 * Hook for storage operations
 *
 * Usage:
 * ```tsx
 * const storage = useStorage();
 * await storage.set('key', { data: 'value' });
 * const value = await storage.get('key');
 * ```
 */
export const useStorage = () => {
  const runtime = useRuntime()

  return {
    get: runtime.storage.get.bind(runtime.storage),
    set: runtime.storage.set.bind(runtime.storage),
    remove: runtime.storage.remove.bind(runtime.storage),
    clear: runtime.storage.clear.bind(runtime.storage),
  }
}
