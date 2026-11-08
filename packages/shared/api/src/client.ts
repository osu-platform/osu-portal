import axios, { AxiosInstance } from "axios"
import { attachAuthInterceptor } from "./interceptors/auth"
import { attachErrorInterceptor } from "./interceptors/error"
import { attachRetryInterceptor } from "./interceptors/retry"

export interface ApiClientConfig {
  baseUrl: string
  timeout?: number
  headers?: Record<string, string>
}

export type ApiClient = AxiosInstance // Or wrapper class if needed later

// Factory function
export const createApiClient = (config: ApiClientConfig): ApiClient => {
  const instance = axios.create({
    baseURL: config.baseUrl,
    timeout: config.timeout || 10000,
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
  })

  // Attach interceptors
  attachAuthInterceptor(instance, {}) // Auth is not implemented yet
  attachErrorInterceptor(instance)
  attachRetryInterceptor(instance)

  return instance
}

// Singleton initialization if needed (e.g. for global access, though context is preferred)
let globalApiInstance: ApiClient | null = null

export const initApi = (baseUrl: string): ApiClient => {
  if (!globalApiInstance) {
    globalApiInstance = createApiClient({ baseUrl })
  }
  // Consider validation if baseUrl changes
  return globalApiInstance
}

export const getApi = (): ApiClient => {
  if (!globalApiInstance) {
    throw new Error(
      "API Client not initialized. Call initApi() first or use ApiProvider."
    )
  }
  return globalApiInstance
}
