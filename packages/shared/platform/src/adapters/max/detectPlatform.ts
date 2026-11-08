/**
 * Platform detection for Max
 */

import type { PlatformType } from "../../types"

// Max WebApp typings
interface MaxWebApp {
  platform?: string
  initDataUnsafe?: {
    query_id?: string
    ip?: string
    auth_date?: number
    hash?: string
    user?: {
      id: number
      first_name?: string
      last_name?: string
      username?: string
      language_code?: string
      photo_url?: string
    }
    chat?: {
      id: number
      type: "DIALOG" | "CHAT" | "CHANNEL"
    }
    /** Deep-link launch token — see @portal/shared-platform's deeplink adapters. */
    start_param?: string
  }
  close(): void
  ready(): void
  /** Bumps screen brightness to max; the client auto-restores it after 30s. */
  requestScreenMaxBrightness?(): Promise<{ maxBrightness: boolean }>
  restoreScreenBrightness?(): Promise<{ maxBrightness: boolean }>
  /**
   * Opens MAX's native QR/barcode scanner (system camera UI, not embedded
   * video) and resolves with the decoded string once a code is read.
   * `fileSelect=false` restricts it to the camera only, no gallery picker —
   * see https://dev.max.ru/docs/webapps/bridge#Сканирование%20QR-кодов.
   * Rejects if the user cancels or the read fails.
   */
  openCodeReader?(fileSelect?: boolean): Promise<string>
  /**
   * Контекст запуска. Единственный дешёвый вызов, который ждёт ответа клиента, — поэтому
   * служит пробой живости моста, см. `probeMaxBridge`.
   */
  getLaunchContext?(): Promise<unknown>
  /**
   * Кнопка «назад» в шапке клиента. Необязательная: у старых клиентов её нет,
   * а веб-клиент её отдаёт, но не рисует — см. `createMaxBackButtonAdapter`.
   */
  BackButton?: MaxBackButton
}

export interface MaxBackButton {
  show(): void
  hide(): void
  onClick(callback: () => void): void
  offClick(callback: () => void): void
  /** Врёт в веб-клиенте: `true` при отсутствующей кнопке. Не использовать для решений. */
  isVisible?: boolean
}

declare global {
  interface Window {
    WebApp?: MaxWebApp
    VK?: unknown
  }
}

/**
 * Определяет платформу через Max WebApp API
 */
export const detectMaxPlatform = (): PlatformType => {
  try {
    const max = window.WebApp

    if (!max?.platform) {
      return "unknown"
    }

    const platform = max.platform.toLowerCase().trim()

    // Маппирование Max платформ на наши типы
    if (platform === "ios") {
      return "ios"
    } else if (platform === "android") {
      return "android"
    } else if (
      platform.includes("desktop") ||
      platform.includes("web") ||
      platform === "web" ||
      platform === "weba"
    ) {
      return "web"
    }

    return "unknown"
  } catch (error) {
    console.warn("Error detecting Max platform:", error)
    return "unknown"
  }
}

/**
 * Получает Max WebApp API
 */
export const getMaxWebApp = (): MaxWebApp | null => {
  return window.WebApp || null
}

/**
 * Кнопка «назад» из моста MAX — или null, если моста нет либо он её не отдаёт.
 */
export const getMaxBackButton = (): MaxBackButton | null => {
  try {
    return window.WebApp?.BackButton ?? null
  } catch {
    // Обращение к чужому объекту может бросить (прокси моста, заблокированное хранилище).
    return null
  }
}
