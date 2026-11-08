import type { HostType } from "../types"
import type { DeepLinkAdapter } from "./types"
import { createTelegramDeepLinkAdapter } from "./telegram"
import { createMaxDeepLinkAdapter } from "./max"
import { createWebDeepLinkAdapter } from "./web"
import { createCapacitorDeepLinkAdapter } from "./capacitor"

export type { DeepLinkAdapter } from "./types"
export { createTelegramDeepLinkAdapter } from "./telegram"
export { createMaxDeepLinkAdapter } from "./max"
export { createWebDeepLinkAdapter } from "./web"
export { createCapacitorDeepLinkAdapter } from "./capacitor"

/** Picks the right adapter for the detected host. Browser/PWA/unknown all read the same query param. */
export const getDeepLinkAdapter = (host: HostType): DeepLinkAdapter => {
  switch (host) {
    case "telegram":
      return createTelegramDeepLinkAdapter()
    case "max":
      return createMaxDeepLinkAdapter()
    case "capacitor":
      return createCapacitorDeepLinkAdapter()
    case "browser":
    case "pwa":
    case "unknown":
    default:
      return createWebDeepLinkAdapter()
  }
}

/** Convenience one-shot: reads and (where applicable) consumes the launch deep-link token. */
export const getDeepLinkStartParam = (host: HostType): string | null =>
  getDeepLinkAdapter(host).getStartParam()
