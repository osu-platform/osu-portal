import type { DeepLinkAdapter } from "./types"

const PARAM = "startapp"

/**
 * Plain browser/PWA — the token travels as a query param, e.g.
 * `https://portal.example/?startapp=events_123`. Stripped from the URL bar
 * on read so it doesn't linger across client-side navigation.
 */
export const createWebDeepLinkAdapter = (): DeepLinkAdapter => ({
  getStartParam() {
    if (typeof window === "undefined") return null

    const url = new URL(window.location.href)
    const value = url.searchParams.get(PARAM)
    if (!value) return null

    url.searchParams.delete(PARAM)
    window.history.replaceState(null, "", url.toString())

    return value
  },
})
