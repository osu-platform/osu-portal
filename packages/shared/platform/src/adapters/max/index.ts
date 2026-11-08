/**
 * Max Host Adapter
 *
 * Max (VK) Mini App environment
 * Runtime: webview
 * Platform: detected via Max WebApp API
 */

import type { HostType, RuntimeType } from "../../types"
import type { RuntimeAdapter } from "../base"
import {
  createDefaultNavigationAdapter,
  createDefaultSafeAreaAdapter,
  createDefaultStorageAdapter,
  createDefaultUpdaterAdapter,
  createBrowserThemeAdapter,
} from "../defaults"
import { detectMaxPlatform, getMaxWebApp } from "./detectPlatform"
import { createMaxNativeAdapter } from "./native"
import { createMaxBackButtonAdapter } from "./backButton"

/**
 * Creates the Max runtime adapter
 */
export const createMaxAdapter = async (): Promise<RuntimeAdapter> => {
  const host: HostType = "max"
  const runtime: RuntimeType = "webview"
  const platform = detectMaxPlatform()

  // Initialize Max WebApp if available
  const max = getMaxWebApp()
  if (max) {
    max.ready()
  }

  return {
    host,
    runtime,
    platform,
    navigation: createDefaultNavigationAdapter(),
    backButton: createMaxBackButtonAdapter(),
    safeArea: createDefaultSafeAreaAdapter(),
    native: createMaxNativeAdapter(),
    storage: createDefaultStorageAdapter(),
    updater: createDefaultUpdaterAdapter(),
    theme: createBrowserThemeAdapter(),
  }
}
