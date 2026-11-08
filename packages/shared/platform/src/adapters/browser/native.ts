/**
 * Browser Native Features
 *
 * Provides access to native-like features using Web APIs.
 */

import type { NativeAdapter } from "../base"

/**
 * Creates browser-specific native adapter
 */
export const createBrowserNativeAdapter = (): NativeAdapter => ({
  vibrate: (type: "light" | "medium" | "heavy") => {
    if (!navigator.vibrate) return

    const pattern = {
      light: 10,
      medium: 50,
      heavy: 100,
    }[type]

    navigator.vibrate(pattern)
  },

  share: async (options) => {
    if (!navigator.share) {
      console.warn("Share API not available")
      return
    }

    try {
      await navigator.share({
        title: options.title,
        text: options.text,
        url: options.url,
      })
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Share error:", error)
      }
    }
  },

  hapticFeedback: (type: "success" | "warning" | "error") => {
    // Fallback to vibration for haptic feedback
    const pattern = {
      success: [10, 20, 10],
      warning: [30, 20, 30],
      error: [50, 30, 50],
    }[type]

    if (navigator.vibrate) {
      navigator.vibrate(pattern)
    }
  },

  // No web API controls device screen brightness — a no-op here, not an error,
  // so callers don't have to branch on platform before asking for it.
  screen: {
    requestMaxBrightness: async () => {},
    restoreBrightness: async () => {},
  },

  // No camera scanner wired up for browser/PWA/Capacitor yet — MAX's native
  // bridge is the only implementation so far. `isSupported`
  // false is the gate callers must check before showing scan UI.
  qrScanner: {
    isSupported: () => false,
    scan: async () => ({
      status: "error" as const,
      message: "Сканер недоступен на этой платформе",
    }),
  },
})
