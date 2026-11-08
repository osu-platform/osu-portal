/**
 * useNative Hook
 *
 * Access native device features (vibration, sharing, haptics)
 */

import { useRuntime } from "./useRuntime"

/**
 * Hook for native features
 *
 * Usage:
 * ```tsx
 * const native = useNative();
 * await native.share({ title: 'Check this out!' });
 * ```
 */
export const useNative = () => {
  const runtime = useRuntime()

  return {
    vibrate: runtime.native.vibrate.bind(runtime.native),
    share: runtime.native.share.bind(runtime.native),
    hapticFeedback: runtime.native.hapticFeedback.bind(runtime.native),
  }
}
