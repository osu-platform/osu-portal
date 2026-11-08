/**
 * Routing Types
 *
 * Core type contracts for the routing system, shared between the core shell
 * and modules. They live in the Shared layer so that modules (and this
 * package) never need to import the runtime.
 *
 * NOTE: Layout is NOT part of routing. Layout is chosen by Application
 * based on authState — routing only handles URL ↔ page mapping and access control.
 */

import type React from "react"

// ─── Guard Types ─────────────────────────────────────────────────────────────

/**
 * Guard controls who can access a route based on the current auth state.
 *
 * - 'public'        accessible to everyone (including unauthenticated)
 * - 'guest'         only for unauthenticated users (login, register)
 *                   authenticated users get redirected away
 * - 'authenticated' requires authState === 'authenticated'
 * - 'onboarding'    requires authState === 'onboarding'
 */
export type Guard = "public" | "guest" | "authenticated" | "onboarding"

// ─── Route Meta ───────────────────────────────────────────────────────────────

/**
 * Metadata attached to every route.
 * Used by GuardWrapper, navigation, and future module system.
 */
export interface RouteMeta {
  guard?: Guard

  /** Human-readable title — used by navigation and future breadcrumbs */
  title?: string

  /**
   * Permissions required to access this route.
   * Reserved for future use — not enforced yet.
   */
  permissions?: string[]
}

// ─── Route Config ─────────────────────────────────────────────────────────────

/**
 * Single route definition used by core and modules.
 *
 * Use `component` for lazy-loaded pages (created with lazyPage()).
 * Use `element` for inline elements (redirects, index routes).
 *
 * Modules define their own internal routes using standard react-router
 * RouteObject / useRoutes — they don't need to use RouteConfig for inner pages.
 * RouteConfig is the contract for registering top-level entry points in core.
 */
export interface RouteConfig {
  path: string

  /**
   * Pre-resolved lazy component created with lazyPage().
   * Created once at module level — never inside a render function.
   */
  component?: React.LazyExoticComponent<React.ComponentType>

  /**
   * Inline element for redirects, index stubs, etc.
   * Used when no code-splitting is needed.
   */
  element?: React.ReactNode

  meta?: RouteMeta
  children?: RouteConfig[]
  index?: boolean
}

// ─── Redirect Policy ─────────────────────────────────────────────────────────

/**
 * Centralised redirect paths used by GuardWrapper.
 * Defined once in constants.ts — never hardcode paths in components.
 */
export interface RedirectPolicy {
  /** Where to send unauthenticated users trying to access protected routes */
  unauthenticated: string
  /** Where to send users in onboarding state when they access authenticated routes */
  onboarding: string
  /** Where to send already-authenticated users trying to access guest-only routes */
  alreadyAuth: string
}

// ─── Guard Check Result ───────────────────────────────────────────────────────

/** Result returned by quickCheckAccess. */
export interface AccessCheckResult {
  allowed: boolean
  redirectTo?: string
}
