/**
 * ModuleProvider
 *
 * Subscribes to ModuleRegistry via useSyncExternalStore and exposes
 * { status, error, retry, getModule } through React context.
 *
 * Placement in App.tsx — innermost wrapper before <Application>:
 *   <ModuleProvider registry={moduleRegistry}>
 *     <BrowserRouter>
 *       <Application />
 *     </BrowserRouter>
 *   </ModuleProvider>
 */

import React, {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import type { IModule } from "@portal/shared-module-types"
import type { ModuleRegistry, ModuleStatus, WidgetEntry } from "./registry"

// ─── Context ─────────────────────────────────────────────────────────────────

interface ModuleContextValue {
  status: ModuleStatus
  error: Error | null
  retry: () => void
  getModule: <T extends IModule>(name: string) => T | undefined
  getWidgets: (slot: string) => WidgetEntry[]
}

const ModuleContext = createContext<ModuleContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

interface ModuleProviderProps {
  registry: ModuleRegistry
  children: ReactNode
}

export const ModuleProvider: React.FC<ModuleProviderProps> = ({
  registry,
  children,
}) => {
  const { status, error } = useSyncExternalStore(
    registry.subscribe,
    registry.getSnapshot
  )

  const value: ModuleContextValue = {
    status,
    error,
    retry: () => registry.retry(),
    getModule: (name) => registry.getModule(name),
    getWidgets: (slot) => registry.getWidgets(slot),
  }

  return (
    <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>
  )
}

// ─── Internal context accessor ───────────────────────────────────────────────

export function useModuleContext(): ModuleContextValue {
  const ctx = useContext(ModuleContext)
  if (!ctx) {
    throw new Error("useModuleContext must be used inside <ModuleProvider>")
  }
  return ctx
}
