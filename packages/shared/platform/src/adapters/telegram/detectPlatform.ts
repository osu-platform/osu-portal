/**
 * Platform detection for Telegram
 */

import type { PlatformType } from "../../types"

// Telegram WebApp typings
export interface TelegramWebApp {
  platform: string
  version: string
  colorScheme: "light" | "dark"
  themeParams: Record<string, string>
  initDataUnsafe?: {
    user?: {
      id: number
      first_name?: string
      last_name?: string
      username?: string
    }
    /** Deep-link launch token — see @portal/shared-platform's deeplink adapters. */
    start_param?: string
  }
  close(): void
  ready(): void
  onEvent(eventType: string, handler: () => void): void
  offEvent(eventType: string, handler: () => void): void
  BackButton?: {
    show(): void
    hide(): void
    onClick(callback: () => void): void
    offClick(callback: () => void): void
  }
  HapticFeedback?: {
    impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft"): void
    notificationOccurred(type: "error" | "success" | "warning"): void
    selectionChanged(): void
  }
}

/**
 * Определяет платформу через Telegram WebApp API
 */
export const detectTelegramPlatform = (): PlatformType => {
  try {
    const tg = (window as any).Telegram?.WebApp as TelegramWebApp | undefined

    if (!tg?.platform) {
      return "unknown"
    }

    const platform = tg.platform.toLowerCase().trim()

    // Маппирование Telegram платформ на наши типы
    if (platform === "ios") {
      return "ios"
    } else if (platform === "android") {
      return "android"
    } else if (
      platform === "tdesktop" ||
      platform === "macos" ||
      platform === "web" ||
      platform === "weba"
    ) {
      // tdesktop, macos, web, weba - всё это десктопные версии
      return platform === "web" || platform === "weba" ? "web" : "tdesktop"
    }

    return "unknown"
  } catch (error) {
    console.warn("Error detecting Telegram platform:", error)
    return "unknown"
  }
}

/**
 * Получает Telegram WebApp API
 */
export const getTelegramWebApp = (): TelegramWebApp | null => {
  return ((window as any).Telegram?.WebApp as TelegramWebApp) || null
}
