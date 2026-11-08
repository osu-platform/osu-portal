/**
 * Starts the module registry once the SDK is available.
 *
 * Modules receive the SDK in init() — so the registry cannot start before
 * RuntimeSdkProvider is mounted. Both apps do this the same way; only the
 * composition root (which modules get loaded) differs.
 */

import React, { ReactNode, useEffect } from "react"
import { ModuleProvider as ModuleProvider_, moduleRegistry } from "@portal/runtime"
import { useSdk } from "@portal/module-sdk"
import { loadModules } from "../modules.config"

interface ModuleProviderProps {
  children: ReactNode
}

export const ModuleProvider: React.FC<ModuleProviderProps> = ({ children }) => {
  const sdk = useSdk()

  useEffect(() => {
    // Start once: the registry keeps its own loader for retry().
    moduleRegistry.start(loadModules, { sdk })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <ModuleProvider_ registry={moduleRegistry}>{children}</ModuleProvider_>
}
