/**
 * Telegram Theme Adapter
 *
 * Provides Telegram WebApp theme parameters
 */

import type { ThemeAdapter } from "../base"
import { getTelegramWebApp } from "./detectPlatform"

/**
 * Creates Telegram theme adapter
 */
export const createTelegramThemeAdapter = (): ThemeAdapter => {
  const tg = getTelegramWebApp()

  return {
    getCurrent: () => {
      if (!tg) return "dark"
      return tg.colorScheme === "light" ? "light" : "dark"
    },

    getColors: () => {
      if (!tg || !tg.themeParams) return null

      // Return Telegram theme parameters as-is
      return tg.themeParams as Record<string, string>
    },

    subscribe: (callback: () => void) => {
      if (!tg) {
        return () => {}
      }

      const handler = () => callback()
      tg.onEvent("themeChanged", handler)

      return () => {
        tg.offEvent("themeChanged", handler)
      }
    },
  }
}
