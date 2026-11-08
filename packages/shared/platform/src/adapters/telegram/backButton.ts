/**
 * Telegram Back Button Adapter
 *
 * Кнопка «назад» в шапке Telegram,
 * core.telegram.org/bots/webapps#backbutton. Набор методов тот же, что у MAX, поэтому за
 * общим контрактом `BackButtonAdapter` разницы между мессенджерами уже не видно.
 *
 * В отличие от MAX веб-клиент здесь не исключается: у Telegram кнопка в вебе рисуется.
 * Живьём это не проверялось — стенда в Telegram нет, — поэтому решение принимается по
 * наличию методов, а не по платформе; если окажется, что какой-то клиент их отдаёт вхолостую,
 * лечится это здесь же, тем же приёмом, что и в `createMaxBackButtonAdapter`.
 */

import type { BackButtonAdapter } from "../base"
import { getTelegramWebApp } from "./detectPlatform"

const getButton = () => {
  try {
    return getTelegramWebApp()?.BackButton ?? null
  } catch {
    return null
  }
}

const warn = (message: string, error?: unknown) => {
  console.warn(`[telegram/backButton] ${message}`, error ?? "")
}

export const createTelegramBackButtonAdapter = (): BackButtonAdapter => {
  const supported = (): boolean => {
    const button = getButton()
    if (!button) return false
    return (
      typeof button.show === "function" &&
      typeof button.hide === "function" &&
      typeof button.onClick === "function" &&
      typeof button.offClick === "function"
    )
  }

  const call = (action: (button: NonNullable<ReturnType<typeof getButton>>) => void) => {
    if (!supported()) return
    const button = getButton()
    if (!button) return
    try {
      action(button)
    } catch (error) {
      warn("мост отказал", error)
    }
  }

  return {
    isSupported: supported,
    show: () => call((button) => button.show()),
    hide: () => call((button) => button.hide()),
    onClick: (callback) => call((button) => button.onClick(callback)),
    offClick: (callback) => call((button) => button.offClick(callback)),
  }
}
