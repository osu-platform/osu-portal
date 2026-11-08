/**
 * Platform abstraction layer types
 *
 * This file contains the core type system for the platform module.
 *
 * Architecture:
 * - Host: Where the app is running (telegram, max, browser, etc.)
 * - Runtime: Execution capabilities (web, pwa, native, webview)
 * - Platform: Operating system/device (ios, android, tdesktop, web)
 *
 * Note: Adapter contracts are in adapters/base.ts
 */

/**
 * Host type - где запущено приложение
 */
export type HostType =
  | "browser"
  | "pwa"
  | "capacitor"
  | "max"
  | "telegram"
  | "unknown"

/**
 * Runtime type - какие возможности доступны
 */
export type RuntimeType = "web" | "pwa" | "native" | "webview"

/**
 * Platform type - операционная система/устройство
 */
export type PlatformType = "ios" | "android" | "tdesktop" | "web" | "unknown"

// Re-export adapter contracts
export type {
  RuntimeAdapter,
  RuntimeInfo,
  NavigationAdapter,
  SafeAreaAdapter,
  SafeAreaInsets,
  NativeAdapter,
  StorageAdapter,
  UpdaterAdapter,
  UpdateCheckResult,
} from "./adapters/base"
