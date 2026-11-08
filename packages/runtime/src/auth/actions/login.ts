/**
 * Login Action
 *
 * Handles manual login via Telegram Widget.
 * Transition: unauthenticated → authenticating → authenticated | onboarding | error
 */

import type { AuthDeps } from "../types"
import type { TelegramWidgetData } from "../../api/auth"
import { authorizeWidget } from "../../api/auth"
import { useAuthStore } from "../store"
import { STORAGE_KEY_TOKEN } from "../constants"
import { loadProfile } from "./helpers"

/** Start widget-based login flow */
export const loginAction = async (
  deps: AuthDeps,
  widgetData: TelegramWidgetData
): Promise<void> => {
  const store = useAuthStore.getState()
  store.setAuthState("authenticating")
  store.setLoading(true)
  store.setError(null)

  try {
    const { data } = await authorizeWidget(deps.api, widgetData)
    const token = data.access_token

    await deps.storage.set(STORAGE_KEY_TOKEN, token)

    const user = await loadProfile(deps.api, token)
    store.setToken(token)
    store.setUser(user)
    store.setAuthState(user.osuId ? "authenticated" : "onboarding")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed"
    store.setError({ code: "LOGIN_FAILED", message })
    store.setAuthState("error")
  } finally {
    store.setLoading(false)
  }
}
