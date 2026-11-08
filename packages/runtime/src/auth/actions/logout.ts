/**
 * Logout Action
 *
 * Clears auth state. Keeps initPhase = 'initialized'.
 */

import type { AuthDeps } from "../types"
import { useAuthStore } from "../store"
import { STORAGE_KEY_TOKEN } from "../constants"

/** Clear token, user data, and reset to unauthenticated */
export const logoutAction = async (deps: AuthDeps): Promise<void> => {
  await deps.storage.remove(STORAGE_KEY_TOKEN)

  const store = useAuthStore.getState()
  store.setToken(null)
  store.setUser(null)
  store.setError(null)
  store.setAuthState("unauthenticated")
  // initPhase stays 'initialized' — user can re-login without re-init
}
