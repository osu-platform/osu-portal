/**
 * Auth Zustand Store
 *
 * Global auth state + simple setters.
 * Business logic lives in actions/, not here.
 */

import { create } from "zustand"
import type { InitPhase, AuthStateValue, AuthUser, AuthError } from "./types"

export interface AuthStoreState {
  initPhase: InitPhase
  authState: AuthStateValue
  isLoading: boolean
  token: string | null
  user: AuthUser | null
  error: AuthError | null
}

interface AuthStoreActions {
  setInitPhase: (phase: InitPhase) => void
  setAuthState: (state: AuthStateValue) => void
  setLoading: (isLoading: boolean) => void
  setToken: (token: string | null) => void
  setUser: (user: AuthUser | null) => void
  setError: (error: AuthError | null) => void
  reset: () => void
}

const INITIAL_STATE: AuthStoreState = {
  initPhase: "initializing",
  authState: "unauthenticated",
  isLoading: false,
  token: null,
  user: null,
  error: null,
}

export const useAuthStore = create<AuthStoreState & AuthStoreActions>(
  (set) => ({
    ...INITIAL_STATE,

    setInitPhase: (initPhase) => set({ initPhase }),
    setAuthState: (authState) => set({ authState }),
    setLoading: (isLoading) => set({ isLoading }),
    setToken: (token) => set({ token }),
    setUser: (user) => set({ user }),
    setError: (error) => set({ error }),

    // Reset keeps initPhase = 'initialized' (no re-init needed after logout)
    reset: () => set({ ...INITIAL_STATE, initPhase: "initialized" }),
  })
)
