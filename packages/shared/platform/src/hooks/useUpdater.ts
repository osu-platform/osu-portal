/**
 * useUpdater Hook
 *
 * App update management
 */

import { useRuntime } from "./useRuntime"

/**
 * Hook for update operations
 *
 * Usage:
 * ```tsx
 * const updater = useUpdater();
 * const result = await updater.checkUpdates();
 * if (result.updateAvailable) {
 *   await updater.downloadUpdate(result.latestVersion!);
 *   await updater.applyUpdate();
 * }
 * ```
 */
export const useUpdater = () => {
  const runtime = useRuntime()

  return {
    checkUpdates: runtime.updater.checkUpdates.bind(runtime.updater),
    downloadUpdate: runtime.updater.downloadUpdate.bind(runtime.updater),
    applyUpdate: runtime.updater.applyUpdate.bind(runtime.updater),
    getCurrentVersion: runtime.updater.getCurrentVersion.bind(runtime.updater),
  }
}
