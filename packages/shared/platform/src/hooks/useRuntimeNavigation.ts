/**
 * useRuntimeNavigation Hook
 *
 * Navigation shortcuts
 */

import { useRuntime } from "./useRuntime"

/**
 * Hook for navigation with runtime adapter
 *
 * Usage:
 * ```tsx
 * const nav = useRuntimeNavigation();
 * nav.push('/schedule');
 * ```
 */
export const useRuntimeNavigation = () => {
  const runtime = useRuntime()

  return {
    push: runtime.navigation.push.bind(runtime.navigation),
    replace: runtime.navigation.replace.bind(runtime.navigation),
    back: runtime.navigation.back.bind(runtime.navigation),
    canGoBack: runtime.navigation.canGoBack.bind(runtime.navigation),
  }
}
