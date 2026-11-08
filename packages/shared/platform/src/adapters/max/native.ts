/**
 * Max Native Features
 *
 * Max (VK) specific native-like features.
 */

import type { NativeAdapter, QrScanResult } from "../base"
import { getMaxWebApp } from "./detectPlatform"

/**
 * Creates Max-specific native adapter
 */
export const createMaxNativeAdapter = (): NativeAdapter => {
  // Check Max WebApp availability (required for initialization)
  getMaxWebApp()

  return {
    vibrate: (type: "light" | "medium" | "heavy") => {
      // Max doesn't provide haptic feedback API
      // Fallback to Web Vibration API
      if (navigator.vibrate) {
        const duration = { light: 10, medium: 50, heavy: 100 }[type]
        navigator.vibrate(duration)
      }
    },

    share: async (options) => {
      // Max doesn't have built-in share API
      // Use Web Share API if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: options.title,
            text: options.text,
            url: options.url,
          })
          return
        } catch (error) {
          console.warn("Share failed, using fallback")
        }
      }

      // Fallback to clipboard
      const text = [options.title, options.text, options.url]
        .filter(Boolean)
        .join("\n")

      if (navigator.clipboard && text) {
        await navigator.clipboard.writeText(text)
      }
    },

    hapticFeedback: (type: "success" | "warning" | "error") => {
      // Max doesn't provide haptic feedback
      // Fallback to vibration patterns
      if (navigator.vibrate) {
        const patterns = {
          success: [10, 20, 10],
          warning: [30, 20, 30],
          error: [50, 30, 50],
        }
        navigator.vibrate(patterns[type])
      }
    },

    screen: {
      // Only Max actually exposes this (window.WebApp.requestScreenMaxBrightness,
      // see MAX Bridge docs) — the client restores it on its own after 30s, but
      // callers still call `restoreBrightness` on close so it doesn't linger.
      requestMaxBrightness: async () => {
        try {
          await getMaxWebApp()?.requestScreenMaxBrightness?.()
        } catch (error) {
          console.warn("Max requestScreenMaxBrightness failed:", error)
        }
      },
      restoreBrightness: async () => {
        try {
          await getMaxWebApp()?.restoreScreenBrightness?.()
        } catch (error) {
          console.warn("Max restoreScreenBrightness failed:", error)
        }
      },
    },

    qrScanner: {
      isSupported: () =>
        typeof getMaxWebApp()?.openCodeReader === "function",

      scan: async (): Promise<QrScanResult> => {
        const max = getMaxWebApp()
        if (!max?.openCodeReader) {
          return { status: "error", message: "Сканер недоступен" }
        }

        try {
          // Camera only (fileSelect=false) — a дежурный should never end up
          // picking a screenshot from the gallery mid-queue.
          const data = await max.openCodeReader(false)
          return { status: "success", data }
        } catch (error) {
          // MAX rejects the same way for "user closed the scanner" and for
          // an actual failure — there is no distinct cancel signal in the
          // bridge response, so this is treated as a cancel, the more
          // common case, rather than surfaced as an error.
          console.warn("Max openCodeReader failed:", error)
          return { status: "cancelled" }
        }
      },
    },
  }
}
