/**
 * useRuntime Hook
 *
 * Access the runtime adapter directly for full control
 */

import { useContext } from "react"
import type { RuntimeAdapter } from "../adapters/base"
import { RuntimeContext } from "./RuntimeProvider"

/**
 * Hook to access the runtime adapter
 *
 * Usage:
 * ```tsx
 * const runtime = useRuntime();
 * runtime.navigation.push('/schedule');
 * ```
 */
export const useRuntime = (): RuntimeAdapter => {
  const adapter = useContext(RuntimeContext)

  if (!adapter) {
    throw new Error("useRuntime must be used within RuntimeProvider")
  }

  return adapter
}
