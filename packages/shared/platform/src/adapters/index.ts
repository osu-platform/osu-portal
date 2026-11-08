/**
 * Platform Adapters
 *
 * Exports all host-specific adapters and adapter contracts
 */

// Export adapter contracts (the "abstract base class")
export type {
  RuntimeAdapter,
  RuntimeInfo,
  NavigationAdapter,
  BackButtonAdapter,
  SafeAreaAdapter,
  SafeAreaInsets,
  NativeAdapter,
  QrScannerAdapter,
  QrScanResult,
  StorageAdapter,
  UpdaterAdapter,
  UpdateCheckResult,
} from "./base"

// Export adapter factories
export { createBrowserAdapter } from "./browser"
export { createPWAAdapter } from "./pwa"
export { createCapacitorAdapter } from "./capacitor"
export { createTelegramAdapter } from "./telegram"
export { createMaxAdapter } from "./max"

// Export helper functions
export {
  detectTelegramPlatform,
  getTelegramWebApp,
} from "./telegram/detectPlatform"
export {
  detectMaxPlatform,
  getMaxWebApp,
  getMaxBackButton,
} from "./max/detectPlatform"
export { probeMaxBridge, isMaxBridgeAlive } from "./max/bridgeProbe"
