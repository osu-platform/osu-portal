/**
 * Platform Runtime Package
 *
 * Provides unified abstraction layer for different runtimes:
 * - Browser (online web)
 * - PWA (offline-capable web app)
 * - Capacitor Native (iOS/Android with native features)
 * - Telegram mini-app
 * - Max mini-app
 */

// Core types
export type { HostType, RuntimeType, PlatformType } from "./types"

// Adapter contracts (think of these as "abstract base classes")
export type {
  RuntimeAdapter,
  RuntimeInfo,
  SafeAreaInsets,
  NavigationAdapter,
  BackButtonAdapter,
  SafeAreaAdapter,
  NativeAdapter,
  QrScannerAdapter,
  QrScanResult,
  StorageAdapter,
  UpdaterAdapter,
  UpdateCheckResult,
  ThemeAdapter,
} from "./adapters/base"

// Runtime detection and initialization
export {
  detectEnvironment,
  getRuntimeInfo,
  initRuntime,
  getRuntimeAdapter,
  resetRuntime,
} from "./runtime"

// React hooks
export {
  RuntimeProvider,
  useRuntime,
  useRuntimeInfo,
  useSafeArea,
  useRuntimeNavigation,
  useNative,
  useStorage,
  useUpdater,
  useRuntimeTheme,
} from "./hooks"

// Adapters (for advanced usage)
export {
  createBrowserAdapter,
  createPWAAdapter,
  createCapacitorAdapter,
  createTelegramAdapter,
  createMaxAdapter,
  detectTelegramPlatform,
  getTelegramWebApp,
  detectMaxPlatform,
  getMaxWebApp,
  getMaxBackButton,
  isMaxBridgeAlive,
} from "./adapters"

// Кнопка «назад» в шапке хоста
export { createBackButtonStack } from "./backButtonStack"
export type { BackButtonStack } from "./backButtonStack"

// Deep links
export {
  getDeepLinkAdapter,
  getDeepLinkStartParam,
  createTelegramDeepLinkAdapter,
  createMaxDeepLinkAdapter,
  createWebDeepLinkAdapter,
  createCapacitorDeepLinkAdapter,
} from "./deeplink"
export type { DeepLinkAdapter } from "./deeplink"
