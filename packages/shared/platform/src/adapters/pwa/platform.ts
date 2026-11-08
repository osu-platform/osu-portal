/**
 * PWA Platform Detection
 *
 * Detects the operating system in PWA environment.
 * Uses User Agent since PWA is still running in browser.
 */

import type { PlatformType } from "../../types"

/**
 * Determines platform in PWA environment via User Agent
 */
export const detectPWAPlatform = (): PlatformType => {
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
