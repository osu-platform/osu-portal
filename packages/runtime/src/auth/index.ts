/**
 * @portal/runtime — Auth Module
 *
 * Manages the authentication state machine:
 *   initializing → initialized
 *   unauthenticated → authenticating → authenticated | onboarding | error
 *
 * Usage:
 *   1. Wrap app with <AuthProvider /> (inside RuntimeProvider + ApiProvider)
 *   2. useAuthState() — read current auth state
 *   3. useAuthActions() — dispatch auth transitions
 */

// Provider
export { AuthProvider } from "./provider"

// Hooks (public API)
export { useAuthState, useAuthActions } from "./hooks"

// Guest bootstrap for hosts without an auth backend (DevKit on fixtures)
export { initializeAsGuest } from "./actions"

// Domain types
export type { InitPhase, AuthStateValue, AuthUser, AuthError } from "./types"

// API types re-exported for consumer convenience
export type {
  TelegramWidgetData,
  StudentVerificationRequest,
} from "../api/auth"
