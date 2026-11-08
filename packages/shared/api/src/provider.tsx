import React, { createContext, useContext, ReactNode } from "react"
import { ApiClient } from "./client"

interface ApiProviderProps {
  apiClient: ApiClient
  children: ReactNode
}

const ApiContext = createContext<ApiClient | null>(null)

export const ApiProvider: React.FC<ApiProviderProps> = ({
  apiClient,
  children,
}) => {
  return <ApiContext.Provider value={apiClient}>{children}</ApiContext.Provider>
}

export const useApiClient = (): ApiClient => {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error("useApiClient must be used within an ApiProvider")
  }
  return context
}
