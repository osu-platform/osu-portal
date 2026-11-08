/**
 * Portal paths and redirect policy.
 *
 * These are storefront concepts: an isolated delivery has no /dashboard and no
 * /login. They therefore live in the shell, not in the runtime.
 * Never hardcode path strings in components — import from here.
 */

import type { RedirectPolicy } from "@portal/runtime"

export const PATHS = {
  // Public / guest
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",

  // Onboarding flow
  onboarding: "/onboarding",
  onboardingVerify: "/onboarding/verify",
  onboardingComplete: "/onboarding/complete",

  // Authenticated
  dashboard: "/dashboard",
  profile: "/profile",
  settings: "/settings",

  // Utility
  notFound: "/not-found",
} as const

export const PORTAL_REDIRECT_POLICY: RedirectPolicy = {
  unauthenticated: PATHS.login,
  onboarding: PATHS.onboarding,
  alreadyAuth: PATHS.dashboard,
}
