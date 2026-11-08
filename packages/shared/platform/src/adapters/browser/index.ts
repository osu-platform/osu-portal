/**
 * Browser Host Adapter
 *
 * Standard browser environment (Chrome, Firefox, Safari, etc.)
 * Runtime: web
 * Platform: detected via User Agent
 */

import type { HostType, RuntimeType } from "../../types"
import type { RuntimeAdapter } from "../base"
import {
  createDefaultNavigationAdapter,
  createDefaultBackButtonAdapter,
  createDefaultSafeAreaAdapter,
  createDefaultStorageAdapter,
  createDefaultUpdaterAdapter,
  createBrowserThemeAdapter,
} from "../defaults"
import { detectBrowserPlatform } from "./platform"
import { createBrowserNativeAdapter } from "./native"

/**
 * Creates the browser runtime adapter
 */
export const createBrowserAdapter = async (): Promise<RuntimeAdapter> => {
  const host: HostType = "browser"
  const runtime: RuntimeType = "web"
  const platform = detectBrowserPlatform()

  return {
    host,
    runtime,
    platform,
    navigation: createDefaultNavigationAdapter(),
    backButton: createDefaultBackButtonAdapter(),
    safeArea: createDefaultSafeAreaAdapter(),
    native: createBrowserNativeAdapter(),
    storage: createDefaultStorageAdapter(),
    updater: createDefaultUpdaterAdapter(),
    theme: createBrowserThemeAdapter(),
  }
}
