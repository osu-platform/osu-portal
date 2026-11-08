/**
 * useSafeArea Hook
 *
 * Access safe area insets for notches, dynamic islands, etc.
 */

import { useEffect, useState } from "react"
import type { SafeAreaInsets } from "../adapters/base"
import { useRuntime } from "./useRuntime"

/**
 * Hook to access safe area insets with automatic updates
 *
 * Usage:
 * ```tsx
 * const insets = useSafeArea();
 * return <div style={{ paddingTop: insets.top }}>;
 * ```
 */
export const useSafeArea = (): SafeAreaInsets => {
  const runtime = useRuntime()
  const [insets, setInsets] = useState<SafeAreaInsets>(
    runtime.safeArea.getInsets()
  )

  useEffect(() => {
    const unsubscribe = runtime.safeArea.subscribe(setInsets)
    return unsubscribe
  }, [runtime])

  return insets
}
