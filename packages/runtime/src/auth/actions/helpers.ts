/**
 * Auth Action Helpers
 *
 * Shared utilities used across auth actions.
 */

import { jwtDecode } from "jwt-decode"
import { getTelegramWebApp, getMaxWebApp } from "@portal/shared-platform"
import type { HostType } from "@portal/shared-platform"
import type { ApiClient } from "@portal/shared-api"
import type { AuthUser, JwtClaims } from "../types"
import type { UserResponse } from "../../api/auth"
import { getMe } from "../../api/auth"

/** Decode JWT token safely, returns null on failure */
export const decodeToken = (token: string): JwtClaims | null => {
  try {
    return jwtDecode<JwtClaims>(token)
  } catch {
    return null
  }
}

/**
 * Get raw initData string for the current host platform.
 *
 * Takes a plain string rather than `HostType`: callers also pass the SDK's
 * `SdkPlatform`, which overlaps but is not the same union. Only "telegram" and
 * "max" carry initData, so anything else correctly yields null.
 */
export const getInitData = (host: HostType | string): string | null => {
  if (host === "telegram") {
    // initData exists on Telegram WebApp but is not typed in our interface
     
    return (getTelegramWebApp() as any)?.initData ?? null
  }

  if (host === "max") {
     
    return (getMaxWebApp() as any)?.initData ?? null
  }

  return null
}

/** Map API UserResponse + JWT claims → domain AuthUser */
export const toAuthUser = (
  apiUser: UserResponse,
  claims: JwtClaims | null
): AuthUser => ({
  id: apiUser.id,
  telegramId: apiUser.telegram_id,
  firstName: apiUser.first_name,
  lastName: apiUser.last_name,
  username: apiUser.username,
  roles: apiUser.roles,
  osuId: claims?.osu_id ?? null,
})

/** Fetch user profile from API and build AuthUser */
export const loadProfile = async (
  api: ApiClient,
  token: string
): Promise<AuthUser> => {
  const { data } = await getMe(api, token)
  const claims = decodeToken(token)
  return toAuthUser(data, claims)
}
