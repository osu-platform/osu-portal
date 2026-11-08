/**
 * Default Safe Area Adapter
 *
 * Uses CSS env() variables for safe area insets.
 * Falls back to ResizeObserver for dynamic updates.
 */

import type { SafeAreaAdapter, SafeAreaInsets } from "../base"

/**
 * Parse safe area insets from CSS env() variables
 */
const getInsetsFromCSS = (): SafeAreaInsets => {
  if (typeof window === "undefined") {
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }

  const root = document.documentElement
  const computedStyle = getComputedStyle(root)

  const top = parseInt(
    computedStyle.getPropertyValue("env(safe-area-inset-top)") || "0",
    10
  )
  const bottom = parseInt(
    computedStyle.getPropertyValue("env(safe-area-inset-bottom)") || "0",
    10
  )
  const left = parseInt(
    computedStyle.getPropertyValue("env(safe-area-inset-left)") || "0",
    10
  )
  const right = parseInt(
    computedStyle.getPropertyValue("env(safe-area-inset-right)") || "0",
    10
  )

  return { top, bottom, left, right }
}

/**
 * Creates default safe area adapter
 */
export const createDefaultSafeAreaAdapter = (): SafeAreaAdapter => ({
  getInsets: getInsetsFromCSS,

  subscribe: (callback) => {
    // Create ResizeObserver to monitor viewport changes
    const observer = new ResizeObserver(() => {
      callback(getInsetsFromCSS())
    })

    observer.observe(document.documentElement)

    // Return unsubscribe function
    return () => observer.disconnect()
  },
})
