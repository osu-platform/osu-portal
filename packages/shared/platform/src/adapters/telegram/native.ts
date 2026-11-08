/**
 * Telegram Native Features
 *
 * Provides access to Telegram-specific native-like features.
 */

import type { NativeAdapter } from "../base"
import { getTelegramWebApp } from "./detectPlatform"

/**
 * Creates Telegram-specific native adapter
 */
export const createTelegramNativeAdapter = (): NativeAdapter => {
  const tg = getTelegramWebApp()

  return {
    vibrate: (type: "light" | "medium" | "heavy") => {
      if (!tg?.HapticFeedback) {
        // Fallback to Web Vibration API
        if (navigator.vibrate) {
          const duration = { light: 10, medium: 50, heavy: 100 }[type]
          navigator.vibrate(duration)
        }
        return
      }

      // Use Telegram haptic feedback
      const style = { light: "light", medium: "medium", heavy: "heavy" }[type]
      tg.HapticFeedback.impactOccurred(
        style as "light" | "medium" | "heavy" | "rigid" | "soft"
      )
    },

    share: async (options) => {
      // Telegram Mini Apps don't provide direct share API
      // Use Web Share API if available, or copy to clipboard
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
      if (!tg?.HapticFeedback) {
        return
      }

      const notificationType = {
        success: "success",
        warning: "warning",
        error: "error",
      }[type]
      tg.HapticFeedback.notificationOccurred(
        notificationType as "error" | "success" | "warning"
      )
    },

    // Telegram's WebApp API has no brightness control — a no-op, same as browser.
    screen: {
      requestMaxBrightness: async () => {},
      restoreBrightness: async () => {},
    },
    // TODO: Add support for Telegram's QR code scanner
    qrScanner: {
      isSupported: () => false,
      scan: async () => ({
        status: "error" as const,
        message: "Сканер недоступен на этой платформе",
      }),
    },
  }
}
