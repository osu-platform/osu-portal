/**
 * Auth Module Types
 *
 * Domain types for the auth state machine.
 */

import type { ApiClient } from "@portal/shared-api"
import type { StorageAdapter, HostType } from "@portal/shared-platform"

/** Initialization phase */
export type InitPhase = "initializing" | "initialized"

/** Authentication state */
export type AuthStateValue =
  | "unauthenticated"
  | "authenticating"
  | "authenticated"
  | "onboarding"
  | "error"

/** Auth error descriptor */
export interface AuthError {
  code: string
  message: string
}

/** Decoded user stored in auth state */
export interface AuthUser {
  id: string
  telegramId: number
  firstName: string
  lastName?: string | null
  username?: string | null
  roles: string[]
  osuId?: number | null
}

/** JWT token claims */
export interface JwtClaims {
  sub: string
  exp: number
  roles?: string[]
  osu_id?: number
  [key: string]: unknown
}

/** Dependencies injected from React context into actions */
export interface AuthDeps {
  api: ApiClient
  storage: StorageAdapter
  host: HostType
}
