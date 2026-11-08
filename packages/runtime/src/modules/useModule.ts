/**
 * Module hooks
 *
 * Consume ModuleProvider context — no direct access to the singleton.
 *
 * useModuleStatus() — loading status, error, and retry callback
 * useModule(slug)   — typed module instance (undefined until status === 'ready')
 */

import type { IModule } from "@portal/shared-module-types"
import { useModuleContext } from "./ModuleProvider"
import type { ModuleStatus, WidgetEntry } from "./registry"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ModuleStatusResult {
  status: ModuleStatus
  error: Error | null
  retry: () => void
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/** Read module loading status and trigger a retry on failure */
export function useModuleStatus(): ModuleStatusResult {
  const { status, error, retry } = useModuleContext()
  return { status, error, retry }
}

/** Get a typed module instance by slug */
export function useModule<T extends IModule>(slug: string): T | undefined {
  const { getModule } = useModuleContext()
  return getModule<T>(slug)
}

/**
 * Get every widget registered for a shell slot, across all loaded modules.
 *
 * Prefer this over useModule(slug) in shell UI — it keeps core agnostic of
 * which concrete modules exist in the current delivery.
 */
export function useModuleWidgets(slot: string): WidgetEntry[] {
  const { getWidgets } = useModuleContext()
  return getWidgets(slot)
}
