/**
 * API Provider Configuration Wrapper
 *
 * Configures and provides the API client to the application
 */

import React, { ReactNode, useMemo } from "react"
import {
  ApiProvider as BaseApiProvider,
  createApiClient,
} from "@portal/shared-api"
import { config } from "@portal/shared-config"

interface ApiProviderProps {
  children: ReactNode
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const api = useMemo(
    () => createApiClient({ baseUrl: config.apiBaseUrl }),
    []
  )

  return <BaseApiProvider apiClient={api}>{children}</BaseApiProvider>
}

// Re-export the hook from shared-api
export { useApiClient } from "@portal/shared-api"
