/**
 * useRuntimeTheme Hook
 *
 * Access runtime theme information with reactive updates
 */

import { useEffect, useState } from "react"
import { useRuntime } from "./useRuntime"
import type { RuntimeThemeInput } from "@portal/shared-theme" //TODO: Review dependency direction - should platform depend on theme types?

/**
 * Hook to access runtime theme with reactive updates
 *
 * Returns theme information from the current platform runtime
 * and automatically subscribes to theme changes
 *
 * Usage:
 * ```tsx
 * const runtimeTheme = useRuntimeTheme();
 * // runtimeTheme will update when platform theme changes
 * ```
 */
export const useRuntimeTheme = (): RuntimeThemeInput => {
  const runtime = useRuntime()

  const [theme, setTheme] = useState<RuntimeThemeInput>(() => ({
    scheme: runtime.theme.getCurrent(),
    colors: runtime.theme.getColors() ?? undefined,
  }))

  useEffect(() => {
    const update = () => {
      setTheme({
        scheme: runtime.theme.getCurrent(),
        colors: runtime.theme.getColors() ?? undefined,
      })
    }

    // Subscribe to theme changes
    const unsubscribe = runtime.theme.subscribe(update)

    return unsubscribe
  }, [runtime])

  return theme
}
