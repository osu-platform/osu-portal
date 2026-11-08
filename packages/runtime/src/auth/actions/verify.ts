/**
 * Verify Student Action
 *
 * Handles student verification during onboarding.
 * Transition: onboarding → authenticated | error
 */

import type { AuthDeps } from "../types"
import type { StudentVerificationRequest } from "../../api/auth"
import { verifyStudent } from "../../api/auth"
import { useAuthStore } from "../store"
import { STORAGE_KEY_TOKEN } from "../constants"
import { loadProfile } from "./helpers"

/** Verify student identity and complete onboarding */
export const verifyAction = async (
  deps: AuthDeps,
  payload: StudentVerificationRequest
): Promise<void> => {
  const store = useAuthStore.getState()
  store.setLoading(true)
  store.setError(null)

  try {
    const currentToken = store.token
    if (!currentToken) {
      throw new Error("No token available for verification")
    }

    const { data } = await verifyStudent(deps.api, currentToken, payload)
    const newToken = data.access_token

    await deps.storage.set(STORAGE_KEY_TOKEN, newToken)

    const user = await loadProfile(deps.api, newToken)
    store.setToken(newToken)
    store.setUser(user)
    store.setAuthState("authenticated")
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Verification failed"
    store.setError({ code: "VERIFY_FAILED", message })
    store.setAuthState("error")
  } finally {
    store.setLoading(false)
  }
}
