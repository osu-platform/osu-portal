/**
 * Initialize Action
 *
 * Handles the initializing → initialized transition.
 * Detects platform, attempts auto-login or validates stored token, loads profile.
 */

import type { AuthDeps, AuthStateValue } from "../types"
import { useAuthStore } from "../store"
import { STORAGE_KEY_TOKEN, isAuthOptional } from "../constants"
import { getInitData, loadProfile } from "./helpers"
import { authorizeTelegram, authorizeMax, validateToken } from "../../api/auth"

/** Guard against concurrent initialization */
let initInProgress = false

/** Main initialization flow */
export const initializeAction = async (deps: AuthDeps): Promise<void> => {
  const { initPhase } = useAuthStore.getState()
  if (initPhase === "initialized" || initInProgress) return

  initInProgress = true
  const store = useAuthStore.getState()
  store.setLoading(true)
  store.setAuthState("authenticating")

  try {
    const token = await resolveToken(deps)

    if (!token) {
      // Optional auth: no token simply means "guest" — the app stays usable.
      finalizeInit("unauthenticated")
      return
    }

    await finalizeWithProfile(deps, token)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Initialization failed"

    if (isAuthOptional()) {
      // A backend that is down or unreachable must not brick a delivery whose
      // core feature works without an account.
      console.warn(`[Portal] Auth unavailable, continuing as guest: ${message}`)
      finalizeInit("unauthenticated")
      return
    }

    store.setError({ code: "INIT_FAILED", message })
    finalizeInit("error")
  } finally {
    initInProgress = false
  }
}

// ── Private helpers ─────────────────────────────────────────

/** Resolve a valid token based on the current host */
const resolveToken = async (deps: AuthDeps): Promise<string | null> => {
  const { api, storage, host } = deps

  // Mini-app flow: auto-authorize with platform initData
  if (host === "telegram" || host === "max") {
    return authorizeByInitData(deps, host)
  }

  // Web flow: check stored token validity
  const storedToken = await storage.get<string>(STORAGE_KEY_TOKEN)
  if (!storedToken) return null

  const { data } = await validateToken(api, storedToken)
  if (data.valid) return storedToken

  // Token expired/invalid — clean up
  await storage.remove(STORAGE_KEY_TOKEN)
  return null
}

/** Authorize using platform-provided initData */
const authorizeByInitData = async (
  deps: AuthDeps,
  host: "telegram" | "max"
): Promise<string | null> => {
  const initData = getInitData(host)
  if (!initData) return null

  const authorize = host === "telegram" ? authorizeTelegram : authorizeMax
  const { data } = await authorize(deps.api, initData)
  return data.access_token
}

/** Load profile, persist token, set final auth state */
const finalizeWithProfile = async (
  deps: AuthDeps,
  token: string
): Promise<void> => {
  await deps.storage.set(STORAGE_KEY_TOKEN, token)

  const user = await loadProfile(deps.api, token)
  const store = useAuthStore.getState()
  store.setToken(token)
  store.setUser(user)

  finalizeInit(user.osuId ? "authenticated" : "onboarding")
  console.log(
    `[Portal] Initialized as ${user.username} (${user.osuId ? "authenticated" : "onboarding"})`
  )
}

/**
 * Mark the session as an initialized guest without contacting anything.
 *
 * Used by hosts that have no auth backend at all — the DevKit on fixtures.
 * Without it the state machine would sit in `initializing` forever and the app
 * would never render.
 */
export const initializeAsGuest = (): void => {
  finalizeInit("unauthenticated")
}

/** Commit final state and mark initialization complete */
const finalizeInit = (authState: AuthStateValue): void => {
  const store = useAuthStore.getState()
  store.setAuthState(authState)
  store.setInitPhase("initialized")
  store.setLoading(false)
}
