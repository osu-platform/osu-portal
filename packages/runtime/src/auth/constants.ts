/**
 * Auth Constants
 *
 * Storage keys and the authentication mode.
 */

/** Key used to persist the access token in storage */
export const STORAGE_KEY_TOKEN = "access_token"

/**
 * How the host treats authentication.
 *
 * - "optional" — the app runs for a guest. Auto-login is still attempted when
 *   the platform provides initData, and personal features light up if it
 *   succeeds; a failure is not fatal. This is the mode isolated deliveries and
 *   the DevKit run in, and the mode the portal runs in today.
 * - "required" — the app is unusable until authenticated; failures put the
 *   state machine into `unauthenticated` and guards redirect to login.
 *
 * This replaces the old `BYPASS_AUTH = true` flag. The behaviour is nearly the
 * same, but it is now a declared mode with a defined meaning rather than a
 * temporary switch that nobody dares to flip — and it is overridable per build
 * via VITE_AUTH_MODE.
 */
export type AuthMode = "optional" | "required"

const envMode = (
  typeof import.meta !== "undefined"
    ? (import.meta as unknown as { env?: Record<string, string | undefined> })
        .env?.VITE_AUTH_MODE
    : undefined
)?.trim()

export const AUTH_MODE: AuthMode = envMode === "required" ? "required" : "optional"

export const isAuthOptional = (): boolean => AUTH_MODE === "optional"
