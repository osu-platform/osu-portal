/**
 * Browser Platform Detection
 *
 * Detects the operating system using User Agent parsing.
 */

import type { PlatformType } from "../../types"

/**
 * Determines platform in browser environment via User Agent
 */
export const detectBrowserPlatform = (): PlatformType => {
  if (typeof navigator === "undefined") {
    return "unknown"
  }

  const ua = navigator.userAgent.toLowerCase()

  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
    return "ios"
  }

  if (ua.includes("android")) {
    return "android"
  }

  if (ua.includes("mac") || ua.includes("win") || ua.includes("linux")) {
    return "web"
  }

  return "unknown"
}
