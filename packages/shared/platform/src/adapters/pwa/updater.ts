/**
 * PWA Updater
 *
 * Manages PWA app updates via Service Worker.
 */

import type { UpdaterAdapter, UpdateCheckResult } from "../base"

/**
 * Creates PWA updater adapter using Service Worker updates
 */
export const createPWAUpdaterAdapter = (): UpdaterAdapter => {
  let registration: ServiceWorkerRegistration | null = null

  // Check for updates on init
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((reg) => {
      registration = reg
      // Check for updates immediately
      reg.update().catch((error) => {
        console.debug("SW update check failed:", error)
      })
    })
  }

  return {
    checkUpdates: async (): Promise<UpdateCheckResult> => {
      if (!registration) {
        return {
          updateAvailable: false,
          currentVersion: "1.0.0",
        }
      }

      try {
        // Check for new service worker
        const newWorker = await registration.update()
        const hasUpdate = newWorker ? true : false

        return {
          updateAvailable: hasUpdate,
          currentVersion: "1.0.0",
          latestVersion: hasUpdate ? "1.0.1" : "1.0.0",
        }
      } catch (error) {
        console.debug("Update check failed:", error)
        return {
          updateAvailable: false,
          currentVersion: "1.0.0",
        }
      }
    },

    downloadUpdate: async (): Promise<boolean> => {
      // PWA auto-downloads in background
      return true
    },

    applyUpdate: async (): Promise<void> => {
      if (!registration?.waiting) {
        console.warn("No waiting service worker")
        return
      }

      // Tell waiting SW to skip waiting (take over immediately)
      registration.waiting.postMessage({ type: "SKIP_WAITING" })

      // Reload when new SW takes over
      let refreshing = false
      navigator.serviceWorker.oncontrollerchange = () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      }
    },

    getCurrentVersion: (): string => {
      return "1.0.0"
    },
  }
}
