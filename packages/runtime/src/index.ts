/**
 * @portal/runtime
 *
 * Everything needed to run modules, and nothing that identifies the portal.
 *
 * Contents:
 * - Authentication state machine and provider
 * - Module registry, provider and hooks
 * - Routing mechanics: matching, guards, lazy pages
 * - The SDK implementation modules talk to
 * - Application bootstrap and the chrome-less layout
 * - System pages: error, 404, access denied
 *
 * Deliberately NOT here: the portal storefront (home, settings, onboarding,
 * auth pages, portal navigation). It lives in a separate internal package that
 * never leaves the monorepo. The runtime must build without it and must not
 * mention any concrete module by name.
 */

// ============================================================================
// Auth
// ============================================================================

export { AuthProvider } from "./auth"
export { useAuthState, useAuthActions, initializeAsGuest } from "./auth"
export type { InitPhase, AuthStateValue, AuthUser, AuthError } from "./auth"
export { AUTH_MODE, isAuthOptional } from "./auth/constants"
export type { AuthMode } from "./auth/constants"

// API Auth types (re-exported for consumer convenience)
export type {
  AuthResponse,
  TokenValidationResponse,
  TelegramWidgetData,
  StudentVerificationRequest,
  StudentVerificationResponse,
  UserRole,
  UserResponse,
} from "./api/auth"

export {
  authorizeTelegram,
  authorizeMax,
  authorizeWidget,
  validateToken,
  refreshToken,
  getMe,
  verifyStudent,
} from "./api/auth"

// ============================================================================
// Application
// ============================================================================

export {
  Application,
  bootstrapApp,
  hideLoader,
  showLoader,
} from "./application"
export type { ApplicationProps } from "./application"

// ============================================================================
// Layout
// ============================================================================

export { SimpleLayout } from "./layout"
export type { SimpleLayoutProps } from "./layout"

// ============================================================================
// System pages
// ============================================================================

export { ErrorPage, NotFoundPage, AccessDeniedPage } from "./pages"
export type { ErrorPageProps } from "./pages"

// ============================================================================
// Routing
// ============================================================================

export {
  AppRoutes,
  DEFAULT_REDIRECT_POLICY,
  setRedirectPolicy,
  getRedirectPolicy,
  quickCheckAccess,
  GuardWrapper,
  lazyPage,
} from "./routing"
export type {
  RouteConfig,
  RouteMeta,
  Guard,
  RedirectPolicy,
  AccessCheckResult,
} from "./routing"

// ============================================================================
// Modules
// ============================================================================

export {
  moduleRegistry,
  ModuleProvider,
  useModule,
  useModuleStatus,
  useModuleWidgets,
} from "./modules"
export type {
  ModuleStatus,
  ModuleSnapshot,
  ModuleStatusResult,
  WidgetEntry,
} from "./modules"
export type { ModuleRegistry } from "./modules"

// ============================================================================
// Module SDK (runtime implementation)
// ============================================================================

export { RuntimeSdkProvider } from "./sdk"
export type { RuntimeSdkProviderProps } from "./sdk"

// ============================================================================
// Deep links
// ============================================================================

export { captureDeepLink, resolveDeepLink } from "./deeplink"
export type { ResolvedDeepLinkResolver } from "./deeplink"
