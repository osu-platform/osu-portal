/**
 * Adapter Contracts
 *
 * Defines the interface that all runtime adapters must implement.
 * Think of this as an "abstract base class" - each adapter (browser, telegram, max, etc.)
 * must implement all these sub-interfaces.
 */

import type { HostType, RuntimeType, PlatformType } from "../types"

/**
 * Safe area insets for notch, dynamic island, etc.
 */
export interface SafeAreaInsets {
  top: number
  bottom: number
  left: number
  right: number
}

/**
 * Navigation adapter contract
 * Handles app navigation and routing
 */
export interface NavigationAdapter {
  push(path: string): void
  replace(path: string): void
  back(): void
  canGoBack(): boolean
}

/**
 * Кнопка «назад» в шапке хоста.
 *
 * Мессенджеры рисуют её сами и ждут, что мини-приложение скажет, когда она нужна и что
 * делать по нажатию: MAX — `window.WebApp.BackButton`, Telegram — `window.Telegram.WebApp
 * .BackButton`, и набор методов у них одинаковый. Везде, где своей шапки у хоста нет
 * (браузер, PWA), `isSupported()` отвечает `false`, и экраны показывают собственную кнопку.
 *
 * `isSupported()` — не «есть ли объект в окне», а «нарисует ли хост кнопку на самом деле»:
 * см. `createMaxBackButtonAdapter`, где веб-клиент MAX отвечает на `show()` без ошибки, но
 * ничего не рисует. Ошибка в эту сторону стоит пользователю выхода с экрана.
 */
export interface BackButtonAdapter {
  isSupported(): boolean
  show(): void
  hide(): void
  onClick(callback: () => void): void
  offClick(callback: () => void): void
}

/**
 * Safe area adapter contract
 * Handles safe regions on screen (notch, dynamic island, etc.)
 */
export interface SafeAreaAdapter {
  getInsets(): SafeAreaInsets
  subscribe(callback: (insets: SafeAreaInsets) => void): () => void
}

/**
 * Native adapter contract
 * Provides access to native device features
 */
export interface NativeAdapter {
  vibrate(type: "light" | "medium" | "heavy"): void
  share(options: { title?: string; text?: string; url?: string }): Promise<void>
  hapticFeedback(type: "success" | "warning" | "error"): void
  screen: ScreenAdapter
  qrScanner: QrScannerAdapter
}

/**
 * Screen brightness control, for content that has to stay legible in bad
 * lighting (a check-in QR held up to a scanner). Only MAX actually raises the
 * brightness — everything else is a no-op, since there is no web-platform
 * API for it.
 */
export interface ScreenAdapter {
  /** MAX auto-restores after 30s on its own; call `restoreBrightness` on close too. */
  requestMaxBrightness(): Promise<void>
  restoreBrightness(): Promise<void>
}

/**
 * Result of a single QR scan attempt.
 */
export type QrScanResult =
  | { status: "success"; data: string }
  | { status: "cancelled" }
  | { status: "error"; message: string }

/**
 * QR scanner adapter contract.
 *
 * Only MAX actually implements this (native bridge `openCodeReader`, see
 * `createMaxNativeAdapter`) — no other host has a real camera scanner
 * integrated yet, so `isSupported()` gates the whole feature and callers
 * must not show a scan UI when it returns false.
 */
export interface QrScannerAdapter {
  /** Cheap, synchronous — call before rendering any scan UI. */
  isSupported(): boolean
  /**
   * Opens the platform's scanner UI and resolves once with one read (or a
   * cancel/error). Callers wanting continuous scanning call this again in a
   * loop after handling each result.
   */
  scan(): Promise<QrScanResult>
}

/**
 * Storage adapter contract
 * Persistent data storage
 */
export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set(key: string, value: unknown): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
}

/**
 * Update check result
 */
export interface UpdateCheckResult {
  updateAvailable: boolean
  currentVersion: string
  latestVersion?: string
  releaseNotes?: string
  downloadUrl?: string
}

/**
 * Updater adapter contract
 * Manages app updates
 */
export interface UpdaterAdapter {
  checkUpdates(background?: boolean): Promise<UpdateCheckResult>
  downloadUpdate(version: string): Promise<boolean>
  applyUpdate(): Promise<void>
  getCurrentVersion(): string
}

/**
 * Theme adapter contract
 * Provides theme information from platform
 */
export interface ThemeAdapter {
  getCurrent(): "light" | "dark"
  getColors(): Record<string, string> | null
  subscribe(callback: () => void): () => void
}

/**
 * Main runtime adapter contract
 *
 * Every host adapter must implement this interface.
 * It's like an abstract base class in Python or an interface in Java.
 *
 * Example:
 * ```ts
 * const telegramAdapter: RuntimeAdapter = {
 *   host: 'telegram',
 *   runtime: 'webview',
 *   platform: 'tdesktop',
 *   navigation: { ... },
 *   safeArea: { ... },
 *   native: { ... },
 *   storage: { ... },
 *   updater: { ... },
 * };
 * ```
 */
export interface RuntimeAdapter {
  // What, where, and how
  readonly host: HostType
  readonly runtime: RuntimeType
  readonly platform: PlatformType

  // Functionality modules
  navigation: NavigationAdapter
  backButton: BackButtonAdapter
  safeArea: SafeAreaAdapter
  native: NativeAdapter
  storage: StorageAdapter
  updater: UpdaterAdapter
  theme: ThemeAdapter
}

/**
 * Runtime information with convenience flags
 */
export interface RuntimeInfo {
  host: HostType
  runtime: RuntimeType
  platform: PlatformType

  // Convenience flags for common checks
  isNative: boolean
  isWeb: boolean
  isPWA: boolean
  isTelegram: boolean
  isMax: boolean
}
