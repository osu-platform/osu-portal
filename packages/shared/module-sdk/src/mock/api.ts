/**
 * Offline API client for the mock SDK.
 *
 * Requests never leave the machine: a custom axios adapter answers from the
 * handler table and refuses anything unmatched. That refusal is deliberate —
 * a DevKit that silently falls through to the network would stop being offline
 * without anyone noticing.
 */

import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios"
import type { ApiClient } from "@portal/shared-api"

export interface MockRequest {
  url: string
  method: string
  params?: Record<string, string> | undefined
  data?: unknown
}

export type MockResponder = (request: MockRequest) => unknown

export interface MockHandler {
  /** HTTP method to match; any method when omitted. */
  method?: string
  /** Matched against the full request URL (baseURL + url). */
  url: string | RegExp
  status?: number
  /** Static body, or a function of the request. */
  response: unknown | MockResponder
}

export interface MockApiOptions {
  handlers?: MockHandler[]
  baseUrl?: string
  /** Artificial latency in ms — useful to see loading states. */
  latencyMs?: number
}

function fullUrl(config: AxiosRequestConfig): string {
  const base = config.baseURL ?? ""
  const url = config.url ?? ""
  if (/^https?:\/\//i.test(url)) return url
  return `${base.replace(/\/$/, "")}/${url.replace(/^\//, "")}`
}

function matches(handler: MockHandler, method: string, url: string): boolean {
  if (handler.method && handler.method.toLowerCase() !== method) return false
  return typeof handler.url === "string"
    ? url.includes(handler.url)
    : handler.url.test(url)
}

function parseData(data: unknown): unknown {
  if (typeof data !== "string") return data
  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

export function createMockApiClient(options: MockApiOptions = {}): ApiClient {
  const { handlers = [], baseUrl = "https://mock.local", latencyMs = 0 } =
    options

  const instance = axios.create({
    baseURL: baseUrl,
    headers: { "Content-Type": "application/json" },
    adapter: async (config) => {
      const method = (config.method ?? "get").toLowerCase()
      const url = fullUrl(config)
      const handler = handlers.find((h) => matches(h, method, url))

      if (latencyMs > 0) {
        await new Promise((r) => setTimeout(r, latencyMs))
      }

      if (!handler) {
        console.warn(
          `[module-sdk/mock] No fixture for ${method.toUpperCase()} ${url} — returning 404. ` +
            `Add a handler to createMockSdk({ handlers }) to cover this call.`
        )
        const response: AxiosResponse = {
          data: { error: "No mock fixture", url, method },
          status: 404,
          statusText: "Not Found (mock)",
          headers: {},
          config: config as never,
        }
        return Promise.reject(
          Object.assign(new Error(`Mock 404: ${method.toUpperCase()} ${url}`), {
            response,
            config,
            isAxiosError: true,
          })
        )
      }

      const body =
        typeof handler.response === "function"
          ? (handler.response as MockResponder)({
              url,
              method,
              params: config.params,
              data: parseData(config.data),
            })
          : handler.response

      return {
        data: body,
        status: handler.status ?? 200,
        statusText: "OK (mock)",
        headers: {},
        config: config as never,
      } as AxiosResponse
    },
  })

  return instance
}
