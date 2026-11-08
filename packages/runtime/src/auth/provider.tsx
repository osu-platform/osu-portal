/**
 * Auth Provider
 *
 * Triggers auth initialization on mount.
 * Does NOT create React context — all state lives in Zustand.
 * Must be placed inside RuntimeProvider and ApiProvider.
 */

import React, { useEffect, type ReactNode } from "react"
import { useAuthActions } from "./hooks"

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Wrap your app with AuthProvider to auto-initialize authentication.
 *
 * ```tsx
 * <RuntimeProvider>
 *   <ApiProvider>
 *     <AuthProvider>
 *       <App />
 *     </AuthProvider>
 *   </ApiProvider>
 * </RuntimeProvider>
 * ```
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { initialize } = useAuthActions()

  useEffect(() => {
    initialize()
  }, [initialize])

  return <>{children}</>
}
