import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios"

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
  _retryCount?: number
}

const MAX_RETRIES = 3

export const attachRetryInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as RetryConfig

      if (!config || !error.response) {
        return Promise.reject(error)
      }

      const status = error.response.status

      // Retry on 401 and 5xx errors
      if (
        (status === 401 || status >= 500) &&
        (config._retryCount || 0) < MAX_RETRIES
      ) {
        config._retry = true
        config._retryCount = (config._retryCount || 0) + 1

        // Exponential backoff or simple delay could be added here
        // For now, simple retry

        // Log the retry attempt
        console.warn(
          `Retrying request ${config.url} (Attempt ${config._retryCount}/${MAX_RETRIES}) due to error ${status}`
        )

        return instance(config)
      }

      return Promise.reject(error)
    }
  )
}
