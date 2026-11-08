/**
 * @portal/module-sdk — the contract between a module and the platform.
 *
 * Everything a module is allowed to know about the world outside itself comes
 * through this surface. A module must never reach for platform globals
 * (`window.WebApp`, `window.Telegram`), never build its own API client and
 * never hardcode an endpoint — `validate-modules` enforces all three.
 *
 * The contract has two implementations:
 *   - runtime  (@portal/runtime) — real auth, real API, real router;
 *   - mock     (@portal/module-sdk/mock) — fixtures, used by the DevKit host
 *     and by module tests.
 *
 * Keep this surface small. Everything added here is an obligation for years.
 */

import type { ApiClient } from "@portal/shared-api"
import type { PortalConfig } from "@portal/shared-config"

/** Where the module physically runs. */
export type SdkHostKind = "portal" | "module-host"

/** Messenger/shell the app is embedded into. */
export type SdkPlatform =
  | "max"
  | "telegram"
  | "web"
  | "pwa"
  | "capacitor"
  | "unknown"

export type SdkThemeMode = "light" | "dark"

export interface SdkSafeArea {
  top: number
  right: number
  bottom: number
  left: number
}

/**
 * Identity as the module sees it.
 *
 * Auth is optional by design: a module must stay usable for a guest and light
 * up personal features once `isAuthenticated` becomes true.
 */
export interface SdkUser {
  /** True only when the portal account is authenticated. */
  isAuthenticated: boolean
  /** Portal account id, null for a guest. */
  id: string | null
  /**
   * Id of the user inside the embedding platform (e.g. MAX user id).
   * Present even for a guest when the app runs inside a messenger — this is
   * what platform-scoped backends (subscriptions, preferences) key on.
   */
  platformUserId: string | null
  /** Which platform `platformUserId` belongs to. */
  platform: SdkPlatform
  firstName: string | null
  lastName: string | null
  roles: string[]
}

export interface SdkNavigation {
  /** In-app navigation. `to` is an app path, e.g. "/schedule/group/42/day". */
  navigate(to: string, options?: { replace?: boolean }): void
  back(): void
  /** Current app path. */
  currentPath(): string
  /** Absolute deep link to an app path — shareable, opens the module directly. */
  buildLink(path: string): string
}

export interface SdkEnvironment {
  host: SdkHostKind
  platform: SdkPlatform
  theme: SdkThemeMode
  safeArea: SdkSafeArea
  /** Dev build (debug affordances allowed). */
  isDev: boolean
  /** True when the SDK is backed by fixtures rather than real systems. */
  isMock: boolean
}

/**
 * Namespaced key/value storage. Implementations prefix keys per module, so two
 * modules using the same key do not collide.
 */
export interface SdkStorage {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  remove(key: string): Promise<void>
}

export interface SdkScreen {
  /** MAX auto-restores after 30s on its own; call `restoreBrightness` on close too. */
  requestMaxBrightness(): Promise<void>
  restoreBrightness(): Promise<void>
}

/**
 * Result of a single QR scan attempt.
 */
export type SdkQrScanResult =
  | { status: "success"; data: string }
  | { status: "cancelled" }
  | { status: "error"; message: string }

/**
 * Camera QR scanner — MAX only for now (native bridge `openCodeReader`).
 * `isSupported()` is the gate: a module must not render scan UI when it
 * returns false, and must fall back to a non-camera flow instead.
 */
export interface SdkQrScanner {
  isSupported(): boolean
  /** Resolves once per read; call again for continuous scanning. */
  scan(): Promise<SdkQrScanResult>
}

/**
 * Кнопка «назад» в шапке хоста.
 *
 * Модуль не знает, кто её рисует — MAX, Telegram или никто: он лишь говорит «пока этот
 * экран (или оверлей) открыт, возврат мой». Регистрации складываются в стек, нажатие
 * получает последняя — открытая поверх экрана модалка закрывается раньше, чем уходит сам
 * экран. Когда никто кнопку не занимает, хост её прячет, и «назад» снова означает «выйти
 * из мини-приложения».
 *
 * `isSupported()` — «нарисует ли хост кнопку на самом деле», а не «есть ли у него API».
 * По нему экран решает, прятать ли свою кнопку «назад»: спрятать при неработающей
 * платформенной значит оставить экран без выхода.
 */
export interface SdkBackButton {
  isSupported(): boolean
  /** Занять кнопку. Возвращает снятие — вызывать при закрытии экрана или оверлея. */
  register(handler: () => void): () => void
}

/**
 * Haptic/vibration feedback — a no-op wherever the platform has no API for
 * it, so a module can call this unconditionally rather than branching on
 * `environment.platform`.
 */
export interface SdkHaptics {
  vibrate(type: "light" | "medium" | "heavy"): void
  notify(type: "success" | "warning" | "error"): void
}

/** The whole platform, as seen by a module. */
export interface ModuleSdk {
  /** Contract version provided by this host. */
  contractVersion: string
  user: SdkUser
  /** API client for the platform API, configured with auth and retry. */
  api: ApiClient
  /**
   * Client for another backend the module owns (schedule, etc.).
   * Base URLs come from `config` — never from a literal in module code.
   * In the mock implementation the returned client is offline too, so a module
   * with its own backend still runs in the DevKit without network access.
   */
  createApiClient(options: { baseUrl: string; timeout?: number }): ApiClient
  navigation: SdkNavigation
  environment: SdkEnvironment
  storage: SdkStorage
  /** Endpoints and runtime settings — modules must not hardcode URLs. */
  config: PortalConfig
  /**
   * Screen brightness control — MAX only (via MAX Bridge); a no-op everywhere
   * else, so a module can call it unconditionally rather than branching on
   * `environment.platform`. Meant for content that must stay legible in bad
   * lighting, e.g. a check-in QR held up to a scanner.
   */
  screen: SdkScreen
  /** Camera QR scanning — see `SdkQrScanner`. */
  qrScanner: SdkQrScanner
  /** Haptic feedback — see `SdkHaptics`. */
  haptics: SdkHaptics
  /** Кнопка «назад» в шапке хоста — см. `SdkBackButton`. */
  backButton: SdkBackButton
  /**
   * TEMPORARY — will be removed once the platform-wide auth lands.
   *
   * Raw signed launch string from the embedding messenger (MAX `initData`),
   * or null outside a messenger and for hosts running on fixtures.
   *
   * Why it exists: a module that owns a backend currently has no way to
   * authenticate against it. The runtime already exchanges this string for a
   * token, but only against the portal core API — a module's own backend
   * cannot accept that token, so the module has to run its own exchange. Until
   * a single auth service issues tokens every backend trusts, that exchange is
   * the module's problem and it needs the raw string to do it.
   *
   * This is a stopgap, not a pattern to build on:
   *  - it hands a module a credential the module then has to handle correctly;
   *  - every module with a backend reimplements the same exchange;
   *  - the string is messenger-specific, so the contract leaks the platform.
   *
   * Do not reach for it for anything other than that exchange — user identity
   * belongs in `user`, and it is deliberately named `unstable_` so that call
   * sites stay easy to find and delete.
   */
  unstable_getInitData(): string | null
}
