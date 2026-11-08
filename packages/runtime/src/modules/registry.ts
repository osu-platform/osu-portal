/**
 * ModuleRegistry
 *
 * Module lifecycle: start(loader) → register/load → initAll → ready.
 *
 * Usage in main.tsx:
 *   moduleRegistry.start(loadModules);  // kicks off async pipeline
 *
 * Usage in components — via ModuleProvider context, not directly:
 *   const schedule = useModule<IScheduleModule>('schedule');
 *
 * useSyncExternalStore contract:
 *   registry.subscribe / registry.getSnapshot
 */

import type React from "react"
import type { IModule, ModuleContext } from "@portal/shared-module-types"
import { checkContractCompatibility } from "@portal/module-sdk"
import type { RouteConfig } from "../routing/types"

export type ModuleStatus = "idle" | "loading" | "ready" | "error"

export interface ModuleSnapshot {
  status: ModuleStatus
  error: Error | null
}

/** A widget contributed by a module to a named shell slot */
export interface WidgetEntry {
  moduleName: string
  render: () => React.ReactNode
}

const LOAD_TIMEOUT_MS = 10_000

export class ModuleRegistry {
  #modules = new Map<string, IModule>()
  #loader: (() => Promise<void>) | null = null
  #context: ModuleContext | null = null
  #listeners = new Set<() => void>()
  // Cached snapshot — new object is created only inside #setStatus.
  // useSyncExternalStore compares by reference: same ref = no re-render.
  #snapshot: ModuleSnapshot = { status: "idle", error: null }

  // ─── useSyncExternalStore contract ─────────────────────────────────────────

  /** Stable reference — safe to pass directly to useSyncExternalStore */
  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }

  /**
   * Stable reference — safe to pass directly to useSyncExternalStore.
   * Always returns the same object until #setStatus is called.
   */
  getSnapshot = (): ModuleSnapshot => this.#snapshot

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  /**
   * Start the loading pipeline: loader() → initAll() → status 'ready'.
   * loader() should call register() / load() for each module.
   * Saves loader internally so retry() can re-run it.
   */
  start(loader: () => Promise<void>, context?: ModuleContext): void {
    this.#loader = loader
    if (context) this.#context = context
    this.#run(loader)
  }

  /**
   * Install the context modules receive in init().
   * The host sets it before start(); module-host and portal pass their own
   * SDK implementation here.
   */
  setContext(context: ModuleContext): void {
    this.#context = context
  }

  /**
   * Re-run the last loader after an error.
   * Clears registered modules and restarts from scratch.
   */
  retry(): void {
    if (!this.#loader) return
    this.#modules.clear()
    this.#run(this.#loader)
  }

  #run(loader: () => Promise<void>): void {
    this.#setStatus("loading", null)

    const pipeline = loader().then(() => this.initAll())
    let timeoutId: ReturnType<typeof setTimeout>
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () =>
          reject(
            new Error(
              `Module loading timed out after ${LOAD_TIMEOUT_MS / 1000}s`
            )
          ),
        LOAD_TIMEOUT_MS
      )
    })

    Promise.race([pipeline, timeout])
      .then(() => this.#setStatus("ready", null))
      .catch((err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err))
        console.error("[ModuleRegistry] Loading failed:", error)
        this.#setStatus("error", error)
      })
      .finally(() => clearTimeout(timeoutId))
  }

  #setStatus(status: ModuleStatus, error: Error | null): void {
    this.#snapshot = { status, error }
    this.#notify()
  }

  #notify(): void {
    this.#listeners.forEach((l) => l())
  }

  // ─── Module management ─────────────────────────────────────────────────────

  /**
   * Register an already-created module instance.
   * Call from inside the loader passed to start().
   */
  register(instance: IModule): void {
    if (!instance.slug) {
      console.error('[ModuleRegistry] register() — module has no "slug"')
      return
    }
    if (this.#modules.has(instance.slug)) {
      console.warn(
        `[ModuleRegistry] "${instance.slug}" is already registered — skipping`
      )
      return
    }
    if (instance.contractVersion) {
      const { compatible, reason } = checkContractCompatibility(
        instance.contractVersion
      )
      if (!compatible) {
        // Refusing loudly beats rendering a module against a contract that no
        // longer holds — the failure mode of the latter is silent and weird.
        throw new Error(
          `[ModuleRegistry] Cannot register "${instance.slug}": ${reason}`
        )
      }
    }
    this.#modules.set(instance.slug, instance)
    console.log(
      `[ModuleRegistry] Registered "${instance.slug}" v${instance.version}`
    )
  }

  /**
   * Load a remote module by URL (hot-loaded dev modules on a separate server).
   * Throws on failure so the start() pipeline catches it.
   *
   * @param url — full URL, e.g. 'http://localhost:5174/module.js'
   */
  async load(url: string): Promise<void> {
    const mod = await import(/* @vite-ignore */ url)

    if (typeof mod.createModule !== "function") {
      throw new Error(
        `[ModuleRegistry] "${url}" does not export createModule()`
      )
    }

    const instance: IModule = mod.createModule()

    if (!instance.slug) {
      throw new Error(
        `[ModuleRegistry] "${url}" returned a module without "slug"`
      )
    }

    this.register(instance)
  }

  /** @internal — called by #run after loader completes */
  async initAll(context?: ModuleContext): Promise<void> {
    const ctx = context ?? this.#context
    if (!ctx) {
      throw new Error(
        "[ModuleRegistry] No ModuleContext installed — call setContext() " +
          "(or start(loader, context)) before loading modules."
      )
    }
    for (const [name, mod] of this.#modules) {
      await mod.init?.(ctx)
      console.log(`[ModuleRegistry] Initialized "${name}"`)
    }
  }

  /** Get a typed module instance by slug */
  getModule<T extends IModule>(slug: string): T | undefined {
    return this.#modules.get(slug) as T | undefined
  }

  /** Get all routes */
  getRoutes(): RouteConfig[] {
    let routes: RouteConfig[] = []
    for (const module of this.getAll()) {
      if (module.routes) {
        routes = [...routes, ...module.routes]
      }
    }

    return routes
  }

  /** Get all registered modules */
  getAll(): IModule[] {
    return Array.from(this.#modules.values())
  }

  /**
   * Collect widgets registered for a given slot across all modules.
   * Core must never reference a concrete module by name — the shell renders
   * whatever the currently registered modules provide for that slot.
   */
  getWidgets(slot: string): WidgetEntry[] {
    const entries: WidgetEntry[] = []
    for (const module of this.getAll()) {
      const render = module.widgets?.[slot]
      if (render) {
        entries.push({ moduleName: module.slug, render })
      }
    }
    return entries
  }
}

/** Global singleton */
export const moduleRegistry = new ModuleRegistry()
