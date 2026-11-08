/**
 * @portal/runtime/routing — Public API
 *
 * The runtime owns the routing mechanics (matching, guards, lazy loading).
 * The route table itself is data supplied by the host: the portal shell brings
 * its pages, module-host brings only what the registered modules declare.
 */

// Route renderer component (uses useRoutes inside a Router)
export { AppRoutes } from "./AppRoutes"

// Types
export type {
  RouteConfig,
  RouteMeta,
  Guard,
  RedirectPolicy,
  AccessCheckResult,
} from "./types"

// Redirect policy — installed by the host
export {
  DEFAULT_REDIRECT_POLICY,
  setRedirectPolicy,
  getRedirectPolicy,
} from "./constants"

// Guard predicates — available for navigation/menu filtering
export {
  quickCheckAccess,
  isPublic,
  requiresAuth,
  requiresOnboarding,
  isGuestOnly,
} from "./guards"

// Guard component — available for custom use in hosts and modules
export { GuardWrapper } from "./GuardWrapper"

// Lazy route component helper (canonical source: @portal/shared-lib)
export { lazyPage } from "./lazyPage"
