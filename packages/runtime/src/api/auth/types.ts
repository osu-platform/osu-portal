/**
 * Auth API Types
 *
 * Request/response types for core authentication endpoints.
 * Derived from OpenAPI specification (openapi.json).
 */

// ── Auth ────────────────────────────────────────────────────

/** POST /auth/authorize/* response */
export interface AuthResponse {
  access_token: string
  token_type: string
  expires_in: number
}

/** POST /auth/validate response */
export interface TokenValidationResponse {
  valid: boolean
  user_id?: string
  roles?: string[]
  scopes?: string[]
  flags?: Record<string, unknown>
}

// ── Authorization requests ──────────────────────────────────

/** POST /auth/authorize/tgWidgetData request */
export interface TelegramWidgetData {
  id: number
  first_name: string
  last_name?: string | null
  username?: string | null
  photo_url?: string | null
  auth_date: number
  hash: string
}

// ── Users ───────────────────────────────────────────────────

/** User role enum */
export type UserRole = "student" | "admin"

/** GET /users/me response */
export interface UserResponse {
  id: string
  telegram_id: number
  first_name: string
  last_name?: string | null
  username?: string | null
  language: "ru"
  is_active: boolean
  roles: UserRole[]
  created_at: string
  last_login?: string | null
}

// ── Student verification ────────────────────────────────────

/** POST /users/verify-student request */
export interface StudentVerificationRequest {
  student_id: number
  first_name: string
  faculty_id: number
}

/** POST /users/verify-student response */
export interface StudentVerificationResponse {
  success: boolean
  access_token: string
  user: Record<string, unknown>
  restrictions?: Record<string, unknown> | null
}
