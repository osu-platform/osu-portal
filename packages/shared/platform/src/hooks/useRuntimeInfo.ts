/**
 * useRuntimeInfo Hook
 *
 * Get detailed information about current runtime environment
 */

import { useEffect, useState } from "react"
import type { RuntimeInfo } from "../adapters/base"
import { getRuntimeInfo } from "../runtime"

/**
 * Hook to access runtime information
 *
 * Returns null while loading, then RuntimeInfo with host/runtime/platform details
 *
 * Usage:
 * ```tsx
 * const info = useRuntimeInfo();
 * if (!info) return <div>Loading...</div>;
 * console.log(info.host, info.platform);
 * ```
 */
export const useRuntimeInfo = (): RuntimeInfo | null => {
  const [info, setInfo] = useState<RuntimeInfo | null>(null)

  useEffect(() => {
    let mounted = true

    const loadInfo = async () => {
      const runtimeInfo = await getRuntimeInfo()
      if (mounted) {
        setInfo(runtimeInfo)
      }
    }

    loadInfo()

    return () => {
      mounted = false
    }
  }, [])

  return info
}
