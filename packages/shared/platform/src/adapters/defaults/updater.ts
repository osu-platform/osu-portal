/**
 * Default Updater Adapter
 *
 * No-op updater for web-based hosts.
 * Native and PWA hosts override this with real update logic.
 */

import type { UpdaterAdapter, UpdateCheckResult } from "../base"

/**
 * Creates default (no-op) updater adapter
 */
export const createDefaultUpdaterAdapter = (): UpdaterAdapter => ({
  checkUpdates: async (): Promise<UpdateCheckResult> => {
    return {
      updateAvailable: false,
      currentVersion: "1.0.0",
    }
  },

  downloadUpdate: async (): Promise<boolean> => {
    return false
  },

  applyUpdate: async (): Promise<void> => {
    // No-op
  },

  getCurrentVersion: (): string => {
    return "1.0.0"
  },
})
