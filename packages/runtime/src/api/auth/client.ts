/**
 * Auth API Client
 *
 * Typed wrapper around ApiClient (axios) for authentication endpoints.
 * Does NOT create its own HTTP client — uses the shared ApiClient instance.
 */

import type { ApiClient } from "@portal/shared-api"
import type {
  AuthResponse,
  TokenValidationResponse,
  TelegramWidgetData,
  StudentVerificationRequest,
  StudentVerificationResponse,
  UserResponse,
} from "./types"

const AUTH_BASE = "/api/core/v1/auth"
const USERS_BASE = "/api/core/v1/users"

/** Authorize via Telegram initData */
export const authorizeTelegram = (api: ApiClient, tgInitData: string) =>
  api.post<AuthResponse>(`${AUTH_BASE}/authorize/tgInitData`, { tgInitData })

/** Authorize via Max initData */
export const authorizeMax = (api: ApiClient, maxInitData: string) =>
  api.post<AuthResponse>(`${AUTH_BASE}/authorize/maxInitData`, { maxInitData })

/** Authorize via Telegram Login Widget */
export const authorizeWidget = (api: ApiClient, data: TelegramWidgetData) =>
  api.post<AuthResponse>(`${AUTH_BASE}/authorize/tgWidgetData`, data)

/** Validate JWT token */
export const validateToken = (api: ApiClient, token: string) =>
  api.post<TokenValidationResponse>(`${AUTH_BASE}/validate`, null, {
    params: { token },
  })

/** Refresh JWT token */
export const refreshToken = (api: ApiClient, token: string) =>
  api.post<AuthResponse>(`${AUTH_BASE}/refresh`, { token })

/** Get current user profile (requires auth header) */
export const getMe = (api: ApiClient, token: string) =>
  api.get<UserResponse>(`${USERS_BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

/** Verify student identity (requires auth header) */
export const verifyStudent = (
  api: ApiClient,
  token: string,
  data: StudentVerificationRequest
) =>
  api.post<StudentVerificationResponse>(`${USERS_BASE}/verify-student`, data, {
    headers: { Authorization: `Bearer ${token}` },
  })
