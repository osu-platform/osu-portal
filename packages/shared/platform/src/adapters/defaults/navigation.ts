/**
 * Default Navigation Adapter
 *
 * Standard browser history API navigation.
 * Used by almost all hosts except native platforms.
 */

import type { NavigationAdapter } from "../base"

/**
 * Creates default navigation adapter using History API
 */
export const createDefaultNavigationAdapter = (): NavigationAdapter => ({
  push: (path: string) => {
    window.history.pushState({}, "", path)
    window.dispatchEvent(new PopStateEvent("popstate"))
  },

  replace: (path: string) => {
    window.history.replaceState({}, "", path)
    window.dispatchEvent(new PopStateEvent("popstate"))
  },

  back: () => {
    window.history.back()
  },

  canGoBack: () => {
    return window.history.length > 1
  },
})
