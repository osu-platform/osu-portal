/**
 * Routing Guards
 *
 * Pure synchronous predicates for access checks.
 * No React, no side effects — easily unit-testable.
 *
 * GuardWrapper uses quickCheckAccess at render time.
 * Navigation uses it to filter visible menu items.
 */

import type { AuthStateValue } from "../auth"
import type { RouteMeta, AccessCheckResult } from "./types"
import { getRedirectPolicy } from "./constants"
import { isAuthOptional } from "../auth/constants"

// ─── Predicates ───────────────────────────────────────────────────────────────

/** Route is accessible to everyone — no auth required */
export const isPublic = (meta?: RouteMeta): boolean =>
  meta?.guard === "public" || meta?.guard === undefined

/** Route is only for non-authenticated users (login, register, etc.) */
export const isGuestOnly = (meta?: RouteMeta): boolean =>
  meta?.guard === "guest"

/** Route requires the user to be fully authenticated */
export const requiresAuth = (meta?: RouteMeta): boolean =>
  meta?.guard === "authenticated"

/** Route is only accessible during the onboarding flow */
export const requiresOnboarding = (meta?: RouteMeta): boolean =>
  meta?.guard === "onboarding"

// ─── Main Access Check ───────────────────────────────────────────────────────

/**
 * Synchronous access check based on current auth state and route meta.
 *
 * Returns { allowed: true } or { allowed: false, redirectTo: '/some-path' }.
 * The redirect path comes from the installed redirect policy — never scattered
 * magic strings.
 */
export const quickCheckAccess = (
  authState: AuthStateValue,
  meta?: RouteMeta
): AccessCheckResult => {
  // Public routes — always accessible
  if (isPublic(meta)) {
    return { allowed: true }
  }

  // Guest-only: accessible only when not authenticated
  if (isGuestOnly(meta)) {
    if (authState === "authenticated") {
      return { allowed: false, redirectTo: getRedirectPolicy().alreadyAuth }
    }
    if (authState === "onboarding") {
      return { allowed: false, redirectTo: getRedirectPolicy().onboarding }
    }
    return { allowed: true }
  }

  // Onboarding: only accessible in 'onboarding' state
  if (requiresOnboarding(meta)) {
    if (authState === "onboarding") return { allowed: true }
    if (authState === "authenticated") {
      return { allowed: false, redirectTo: getRedirectPolicy().alreadyAuth }
    }
    return { allowed: false, redirectTo: getRedirectPolicy().unauthenticated }
  }

  // Authenticated: only accessible when fully logged in
  if (requiresAuth(meta)) {
    if (authState === "authenticated") return { allowed: true }
    // Optional-auth hosts (DevKit, isolated delivery, and the portal today)
    // let a guest through and rely on the page to degrade gracefully.
    // Sending a guest to a login screen there would be a dead end.
    if (isAuthOptional()) return { allowed: true }
    if (authState === "onboarding") {
      return { allowed: false, redirectTo: getRedirectPolicy().onboarding }
    }
    return { allowed: false, redirectTo: getRedirectPolicy().unauthenticated }
  }

  return { allowed: true }
}
