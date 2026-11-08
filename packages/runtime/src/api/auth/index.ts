/**
 * Auth API
 *
 * Public API for core authentication endpoints.
 */

export type {
  AuthResponse,
  TokenValidationResponse,
  TelegramWidgetData,
  StudentVerificationRequest,
  StudentVerificationResponse,
  UserRole,
  UserResponse,
} from "./types"

export {
  authorizeTelegram,
  authorizeMax,
  authorizeWidget,
  validateToken,
  refreshToken,
  getMe,
  verifyStudent,
} from "./client"
