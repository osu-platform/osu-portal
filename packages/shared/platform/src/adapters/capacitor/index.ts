/**
 * Capacitor Host Adapter
 *
 * Native app via Capacitor
 * Runtime: native
 * Platform: detected via Capacitor API
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
import { detectCapacitorPlatform } from "./platform"
import { createBrowserNativeAdapter } from "../browser/native"

/**
 * Creates the Capacitor runtime adapter
 *
 * NOTE: Currently uses web fallbacks. When Capacitor plugins are needed:
 * - Install @capacitor/haptics for native vibration
 * - Install @capacitor/share for native sharing
 * - Install @capacitor/app-update for app updates
 */
export const createCapacitorAdapter = async (): Promise<RuntimeAdapter> => {
  const host: HostType = "capacitor"
  const runtime: RuntimeType = "native"
  const platform = detectCapacitorPlatform()

  return {
    host,
    runtime,
    platform,
    navigation: createDefaultNavigationAdapter(),
    backButton: createDefaultBackButtonAdapter(),
    safeArea: createDefaultSafeAreaAdapter(),
    native: createBrowserNativeAdapter(), // Use Web APIs until Capacitor plugins integrated
    storage: createDefaultStorageAdapter(),
    updater: createDefaultUpdaterAdapter(), // No-op until app update plugin integrated
    theme: createBrowserThemeAdapter(),
  }
}
