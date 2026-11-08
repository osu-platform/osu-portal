/**
 * Runtime Detection and Initialization
 *
 * Detects the host environment and initializes the appropriate adapter
 */

import type { HostType, RuntimeType } from "./types"
import type { RuntimeAdapter, RuntimeInfo } from "./adapters/base"
import {
  createBrowserAdapter,
  createPWAAdapter,
  createCapacitorAdapter,
  createTelegramAdapter,
  createMaxAdapter,
  probeMaxBridge,
} from "./adapters"

let runtimeAdapter: RuntimeAdapter | null = null
let runtimeInfo: RuntimeInfo | null = null
let scriptsLoaded: Record<string, boolean> = {}

/**
 * Загружает внешний скрипт
 */
const loadScript = (url: string): Promise<void> => {
  if (scriptsLoaded[url]) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = url
    script.async = true
    script.onload = () => {
      scriptsLoaded[url] = true
      resolve()
    }
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`))
    document.head.appendChild(script)
  })
}

/**
 * Детектирует окружение (host + runtime) одновременно
 */
export const detectEnvironment = (): {
  host: HostType
  runtime: RuntimeType
} => {
  if (typeof window === "undefined") {
    return { host: "unknown", runtime: "web" }
  }

  // Проверка Telegram через TelegramWebviewProxy
  // Это самый надежный способ определить Telegram webview
  if ("TelegramWebviewProxy" in window) {
    return { host: "telegram", runtime: "webview" }
  }

  // Проверка Max через ancestorOrigins (браузер / iframe на max.ru)
  try {
    if (
      window.location.ancestorOrigins &&
      window.location.ancestorOrigins.length > 0
    ) {
      const origin = window.location.ancestorOrigins[0]
      if (origin && origin.includes("max.ru")) {
        return { host: "max", runtime: "webview" }
      }
    }
  } catch (e) {
    // Security error в некоторых браузерах
  }

  // Проверка Max через SDK (нативный мобильный WebView).
  // SDK загружается синхронно из index.html до старта React, поэтому
  // window.WebApp доступен здесь. initData непустой только внутри MAX.
  if ((window as any).WebApp?.initData) {
    return { host: "max", runtime: "webview" }
  }

  // Проверка Capacitor (наличие глобального объекта Capacitor)
  if ("Capacitor" in window) {
     
    const cap = (window as any).Capacitor
    if (cap?.isNativePlatform?.()) {
      return { host: "capacitor", runtime: "native" }
    }
  }

  // Проверка PWA - установленное приложение
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return { host: "pwa", runtime: "pwa" }
  }

  // iOS standalone mode (добавлено на главный экран)
  if ("standalone" in navigator && (navigator as any).standalone) {
    return { host: "pwa", runtime: "pwa" }
  }

  // Service Worker активен - может быть PWA
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    return { host: "pwa", runtime: "pwa" }
  }

  // По умолчанию - обычный браузер
  return { host: "browser", runtime: "web" }
}

/**
 * Gets detailed runtime information
 * Note: Platform determination is delegated to the adapter
 */
export const getRuntimeInfo = async (): Promise<RuntimeInfo> => {
  if (runtimeInfo) return runtimeInfo

  const { host, runtime } = detectEnvironment()

  runtimeInfo = {
    host,
    runtime,
    platform: "unknown",
    isNative: runtime === "native",
    isWeb: runtime === "web",
    isPWA: runtime === "pwa",
    isTelegram: host === "telegram",
    isMax: host === "max",
  }

  return runtimeInfo
}

/**
 * Initializes the runtime adapter based on detected environment
 */
export const initRuntime = async (): Promise<RuntimeAdapter> => {
  if (runtimeAdapter) return runtimeAdapter

  const info = await getRuntimeInfo()

  // ВАЖНО: Загружаем скрипты ДО создания адаптера!
  // window.Telegram.WebApp и window.WebApp должны быть доступны
  // ДО того как адаптер попытается обратиться к этим объектам
  if (info.host === "telegram") {
    try {
      await loadScript("https://telegram.org/js/telegram-web-app.js?59")
    } catch (error) {
      console.warn("Failed to load Telegram SDK:", error)
    }
  } else if (info.host === "max") {
    try {
      await loadScript("https://st.max.ru/js/max-web-app.js")
      // Мост может молчать, отвечая при этом на вызовы без ошибки (см. probeMaxBridge).
      // Спрашиваем один раз здесь, пока запуск и так асинхронный: дальше адаптеры читают
      // готовый ответ синхронно и экраны не мигают своими кнопками в ожидании.
      await probeMaxBridge()
    } catch (error) {
      console.warn("Failed to load Max SDK:", error)
    }
  }

  // Теперь создаем адаптер (скрипты уже загружены)
  switch (info.host) {
    case "telegram":
      runtimeAdapter = await createTelegramAdapter()
      break
    case "max":
      runtimeAdapter = await createMaxAdapter()
      break
    case "capacitor":
      runtimeAdapter = await createCapacitorAdapter()
      break
    case "pwa":
      runtimeAdapter = await createPWAAdapter()
      break
    case "browser":
    case "unknown":
    default:
      runtimeAdapter = await createBrowserAdapter()
      break
  }

  // Обновляем информацию о платформе из адаптера (важно для Telegram и Max)
  if (runtimeAdapter && runtimeInfo) {
    runtimeInfo.platform = runtimeAdapter.platform
    console.log("Runtime initialized:", runtimeInfo)
  }

  return runtimeAdapter
}

/**
 * Gets the current runtime adapter (must be initialized first)
 */
export const getRuntimeAdapter = (): RuntimeAdapter => {
  if (!runtimeAdapter) {
    throw new Error("Runtime not initialized. Call initRuntime() first.")
  }
  return runtimeAdapter
}

/**
 * Resets the runtime (for testing purposes)
 */
export const resetRuntime = (): void => {
  runtimeAdapter = null
  runtimeInfo = null
  scriptsLoaded = {}
}
