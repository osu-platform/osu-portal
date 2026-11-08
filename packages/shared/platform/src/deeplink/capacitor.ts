import type { DeepLinkAdapter } from "./types"

/**
 * Placeholder — Capacitor launches carry the deep link as a custom URI
 * (e.g. `portal://events/123`), delivered async via the `App` plugin's
 * `appUrlOpen` event, not readable synchronously at boot like the other
 * hosts. Wiring that up is future work; for now this host simply has no
 * deep link on launch.
 */
export const createCapacitorDeepLinkAdapter = (): DeepLinkAdapter => ({
  getStartParam() {
    return null
  },
})
