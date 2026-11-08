/**
 * Auth Hooks
 *
 * Public React hooks for accessing auth state and actions.
 * State comes from Zustand store. Dependencies come from React context.
 */

import { useCallback } from "react"
import { useShallow } from "zustand/react/shallow"
import { useApiClient } from "@portal/shared-api"
import { useRuntime } from "@portal/shared-platform"
import type { AuthDeps } from "./types"
import type {
  TelegramWidgetData,
  StudentVerificationRequest,
} from "../api/auth"
import { useAuthStore } from "./store"
import {
  initializeAction,
  loginAction,
  verifyAction,
  logoutAction,
} from "./actions"

/** Read-only auth state (shallow-compared to avoid unnecessary re-renders) */
export const useAuthState = () =>
  useAuthStore(
    useShallow((s) => ({
      initPhase: s.initPhase,
      authState: s.authState,
      isLoading: s.isLoading,
      token: s.token,
      user: s.user,
      error: s.error,
    }))
  )

/** Auth action dispatchers */
export const useAuthActions = () => {
  const api = useApiClient()
  const runtime = useRuntime()

  // runtime is a stable context reference, so deps are stable
  const getDeps = useCallback(
    (): AuthDeps => ({ api, storage: runtime.storage, host: runtime.host }),
    [api, runtime]
  )

  const initialize = useCallback(() => initializeAction(getDeps()), [getDeps])

  const logout = useCallback(() => logoutAction(getDeps()), [getDeps])

  const startWidgetLogin = useCallback(
    (widgetData: TelegramWidgetData) => loginAction(getDeps(), widgetData),
    [getDeps]
  )

  const verifyStudent = useCallback(
    (payload: StudentVerificationRequest) => verifyAction(getDeps(), payload),
    [getDeps]
  )

  return { initialize, logout, startWidgetLogin, verifyStudent }
}
