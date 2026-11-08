/**
 * Max Back Button Adapter
 *
 * Кнопка «назад» в шапке клиента MAX,
 * dev.max.ru/docs/webapps/bridge — «Управление кнопкой „Назад“ в шапке приложения».
 *
 * Ни одна платформа здесь не исключена. Раньше исключался весь веб — по проверке 30.08.2026
 * в web.max.ru, где `show()` проходил, а стрелка не появлялась. Вывод «веб-клиент кнопку не
 * рисует» оказался неверным: рисует, но только мини-приложению с того origin, что
 * зарегистрирован за ботом, а проверяли со стенда на чужом домене. Заодно то исключение
 * гасило кнопку на десктопе, потому что `detectMaxPlatform` сводит `desktop` и `web` к одному
 * значению.
 *
 * Признак поддержки — не платформа, а ответ клиента на пробу (`probeMaxBridge`): слышит ли он
 * нас вообще. Спрашивать сам мост бесполезно, `isVisible` говорит о локальном состоянии SDK,
 * а не о шапке. Про то, как стенды попадают на зарегистрированный origin, — tools/max-dev-relay.
 *
 * Вызовы обёрнуты в try/catch: это чужой код в чужом окружении, и его отказ должен
 * означать «навигация как в браузере», а не белый экран.
 */

import type { BackButtonAdapter } from "../base"
import { isMaxBridgeAlive } from "./bridgeProbe"
import { getMaxBackButton } from "./detectPlatform"

const warn = (message: string, error?: unknown) => {
  console.warn(`[max/backButton] ${message}`, error ?? "")
}

export const createMaxBackButtonAdapter = (): BackButtonAdapter => {
  const supported = (): boolean => {
    if (!isMaxBridgeAlive()) return false
    const button = getMaxBackButton()
    if (!button) return false
    return (
      typeof button.show === "function" &&
      typeof button.hide === "function" &&
      typeof button.onClick === "function" &&
      typeof button.offClick === "function"
    )
  }

  const call = (action: (button: NonNullable<ReturnType<typeof getMaxBackButton>>) => void) => {
    if (!supported()) return
    const button = getMaxBackButton()
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
