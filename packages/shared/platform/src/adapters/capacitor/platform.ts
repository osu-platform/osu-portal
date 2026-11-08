/**
 * Capacitor Platform Detection
 *
 * Detects the native platform using Capacitor API.
 */

import type { PlatformType } from "../../types"

const getCapacitor = () => {
  if (typeof window === "undefined") return null
   
  return (window as any).Capacitor || null
}

/**
 * Determines platform using Capacitor's native platform detection
 */
export const detectCapacitorPlatform = (): PlatformType => {
  const capacitor = getCapacitor()

  if (!capacitor) {
    return "unknown"
  }

  try {
    const platform = capacitor.getPlatform()

    if (platform === "ios") {
      return "ios"
    }

    if (platform === "android") {
      return "android"
    }

    if (platform === "web") {
      return "web"
    }

    return "unknown"
  } catch (error) {
    console.warn("Error detecting Capacitor platform:", error)
    return "unknown"
  }
}
