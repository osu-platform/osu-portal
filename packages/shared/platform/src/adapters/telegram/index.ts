/**
 * Telegram Host Adapter
 *
 * Telegram Mini App environment
 * Runtime: webview
 * Platform: detected via Telegram WebApp API
 */

import type { HostType, RuntimeType } from "../../types"
import type { RuntimeAdapter } from "../base"
import {
  createDefaultNavigationAdapter,
  createDefaultSafeAreaAdapter,
  createDefaultStorageAdapter,
  createDefaultUpdaterAdapter,
} from "../defaults"
import { detectTelegramPlatform, getTelegramWebApp } from "./detectPlatform"
import { createTelegramNativeAdapter } from "./native"
import { createTelegramThemeAdapter } from "./theme"
import { createTelegramBackButtonAdapter } from "./backButton"

/**
 * Creates the Telegram runtime adapter
 *
 * IMPORTANT: window.Telegram.WebApp is ALREADY AVAILABLE when the app
 * is opened as a Mini App. The Telegram script is injected by Telegram itself
 * BEFORE your app loads. You don't need to load it separately - it's already there!
 */
export const createTelegramAdapter = async (): Promise<RuntimeAdapter> => {
  const host: HostType = "telegram"
  const runtime: RuntimeType = "webview"
  const platform = detectTelegramPlatform()

  // Initialize Telegram WebApp if available
  const tg = getTelegramWebApp()
  if (tg) {
    tg.ready()
  }

  return {
    host,
    runtime,
    platform,
    navigation: createDefaultNavigationAdapter(),
    backButton: createTelegramBackButtonAdapter(),
    safeArea: createDefaultSafeAreaAdapter(), // Use default CSS env() logic
    native: createTelegramNativeAdapter(),
    storage: createDefaultStorageAdapter(),
    updater: createDefaultUpdaterAdapter(),
    theme: createTelegramThemeAdapter(),
  }
}
