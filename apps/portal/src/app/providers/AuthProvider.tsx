/**
 * API Provider Configuration Wrapper
 *
 *
 */

import React, { ReactNode } from "react"
import { AuthProvider as BaseAuthProvider } from "@portal/runtime"

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return <BaseAuthProvider>{children}</BaseAuthProvider>
}
