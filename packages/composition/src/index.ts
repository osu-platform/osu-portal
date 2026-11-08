// Default public composition. A consuming workspace can override this package alias.
import { moduleRegistry } from "@portal/runtime"
export async function loadModules(): Promise<void> {
  const schedule = await import("@portal/modules-schedule")
  moduleRegistry.register(schedule.createModule())
}
export async function loadMockHandlers() {
  const schedule = await import("@portal/modules-schedule")
  return schedule.createMockHandlers()
}
