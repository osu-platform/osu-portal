/**
 * @portal/runtime/modules
 *
 * Module registration and management system.
 */

export { moduleRegistry, ModuleRegistry } from "./registry"
export type { ModuleStatus, ModuleSnapshot, WidgetEntry } from "./registry"

export { ModuleProvider } from "./ModuleProvider"

export { useModule, useModuleStatus, useModuleWidgets } from "./useModule"
export type { ModuleStatusResult } from "./useModule"
