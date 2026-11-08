/**
 * PWA Host Adapter
 *
 * Progressive Web App environment (installed app)
 * Runtime: pwa
 * Platform: detected via User Agent
 */

import type { HostType, RuntimeType } from "../../types"
import type { RuntimeAdapter } from "../base"
import {
  createDefaultNavigationAdapter,
  createDefaultBackButtonAdapter,
  createDefaultSafeAreaAdapter,
  createDefaultStorageAdapter,
  createBrowserThemeAdapter,
} from "../defaults"
import { detectPWAPlatform } from "./platform"
import { createBrowserNativeAdapter } from "../browser/native"
import { createPWAUpdaterAdapter } from "./updater"

/**
 * Creates the PWA runtime adapter
 */
export const createPWAAdapter = async (): Promise<RuntimeAdapter> => {
  const host: HostType = "pwa"
  const runtime: RuntimeType = "pwa"
  const platform = detectPWAPlatform()

  return {
    host,
    runtime,
    platform,
    navigation: createDefaultNavigationAdapter(),
    backButton: createDefaultBackButtonAdapter(),
    safeArea: createDefaultSafeAreaAdapter(),
    native: createBrowserNativeAdapter(), // Reuse Browser web APIs
    storage: createDefaultStorageAdapter(),
    updater: createPWAUpdaterAdapter(),
    theme: createBrowserThemeAdapter(),
  }
}
