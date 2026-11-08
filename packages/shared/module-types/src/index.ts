import type React from "react"
import type { ModuleSdk } from "@portal/module-sdk"
import type { RouteConfig } from "./routing"
import type { DeepLinkResolver } from "./deeplink"

export type {
  Guard,
  RouteMeta,
  RouteConfig,
  RedirectPolicy,
  AccessCheckResult,
} from "./routing"

export type { DeepLinkResolver } from "./deeplink"

/**
 * Everything a module receives at init time.
 *
 * The platform is reachable only through `sdk` — see @portal/module-sdk.
 */
export interface ModuleContext {
  sdk: ModuleSdk
}

/** A widget a module contributes to a named host slot. */
export type ModuleWidget = () => React.ReactNode

export interface IModule {
  /** Internal, stable module identifier (e.g. "events"). Used as a key by the host — never shown to users. */
  slug: string

  /** Human-readable module name shown in the UI. */
  name: string

  /** Short human-readable description of what the module does. */
  description: string

  /** Icon shown alongside the module's name in navigation, dashboard, etc. */
  icon?: ModuleWidget

  /** Whether the module should be shown in the UI. Static — not per-user. */
  visible: boolean

  /** Sort order among modules in navigation/dashboard listings (lower first). */
  order: number

  version: string

  /**
   * Version of @portal/module-sdk this module was written against.
   * The host refuses to run a module whose contract it cannot satisfy.
   * Optional for now (legacy modules); required for new ones.
   */
  contractVersion?: string

  /** Optional widgets the module provides to the host (dashboard, etc.) */
  widgets?: Record<string, ModuleWidget>

  /** Called once after the module is loaded, before React renders */
  init?(context: ModuleContext): void | Promise<void>

  /** Called when the module is unloaded (future use) */
  destroy?(): void
  routes?: RouteConfig[]

  /** Claims a deep-link prefix (defaults to `slug`) and resolves its tokens to in-app paths. */
  deepLink?: DeepLinkResolver
}

/** Factory every module package exports as `createModule`. */
export type ModuleFactory = () => IModule
