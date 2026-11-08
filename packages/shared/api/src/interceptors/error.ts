import { AxiosInstance, AxiosError } from "axios"
import type { DomainErrorBody, FastApiErrorBody } from "../types"

const FALLBACK_NETWORK_MESSAGE =
  "Нет связи с сервером. Проверьте подключение и попробуйте ещё раз."
const FALLBACK_SERVER_MESSAGE = "Что-то пошло не так. Попробуйте ещё раз."

/**
 * Pulls a user-presentable message out of a backend error body. The backend
 * has two distinct shapes depending on where the request failed:
 * `{error: {code, message}}` from a `DomainError` (capacity full, already
 * registered, etc. — see `backend/.../web/app.py`), or FastAPI's own
 * `{detail: ...}` for requests that never reach a domain service call
 * (auth failures, pydantic validation).
 */
function extractServerMessage(data: unknown): string | undefined {
  const domainBody = data as Partial<DomainErrorBody> | undefined
  if (typeof domainBody?.error?.message === "string") {
    return domainBody.error.message
  }

  const fastApiBody = data as Partial<FastApiErrorBody> | undefined
  if (typeof fastApiBody?.detail === "string") {
    return fastApiBody.detail
  }
  if (Array.isArray(fastApiBody?.detail)) {
    const first = fastApiBody.detail.find((item) => item?.msg)
    if (first?.msg) return first.msg
  }

  return undefined
}

export const attachErrorInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response) => {
      // Pass through successful responses
      return response
    },
    (error: AxiosError) => {
      const status = error.response?.status
      const serverMessage = extractServerMessage(error.response?.data)
      const isNetworkError = !error.response

      // Rewrite `error.message` in place so every caller reading it off a
      // caught/mutation error — a button caption, a toast — gets text a
      // student can act on, instead of axios' generic "Request failed with
      // status code 409".
      error.message =
        serverMessage ??
        (isNetworkError ? FALLBACK_NETWORK_MESSAGE : FALLBACK_SERVER_MESSAGE)

      if (status && status >= 400) {
        console.error(`API Error [${status}]: ${error.message}`, {
          url: error.config?.url,
          method: error.config?.method,
          data: error.response?.data,
        })
      } else {
        console.error(`Network or Unknown Error: ${error.message}`, error)
      }

      return Promise.reject(error)
    }
  )
}
