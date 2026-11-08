/**
 * Routing Types
 *
 * The canonical definitions live in @portal/shared-module-types (Shared layer)
 * so modules can use them without depending on core. Re-exported here to keep
 * the core public API stable.
 */

export type {
  Guard,
  RouteMeta,
  RouteConfig,
  RedirectPolicy,
  AccessCheckResult,
} from "@portal/shared-module-types"
