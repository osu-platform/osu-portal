/**
 * Redirect policy.
 *
 * The runtime must not know portal paths — `/dashboard` and `/login` are shell
 * concepts and do not exist in an isolated delivery. So the policy is data the
 * host supplies at bootstrap; the defaults below are deliberately neutral.
 *
 * The portal installs its own policy at bootstrap; an isolated host keeps the
 * neutral defaults.
 */

import type { RedirectPolicy } from "./types"

export const DEFAULT_REDIRECT_POLICY: RedirectPolicy = {
  unauthenticated: "/",
  onboarding: "/",
  alreadyAuth: "/",
}

let redirectPolicy: RedirectPolicy = { ...DEFAULT_REDIRECT_POLICY }

/** Install the host's redirect policy. Call once, before rendering routes. */
export function setRedirectPolicy(policy: Partial<RedirectPolicy>): void {
  redirectPolicy = { ...redirectPolicy, ...policy }
}

export function getRedirectPolicy(): RedirectPolicy {
  return redirectPolicy
}
