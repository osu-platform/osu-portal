/**
 * @portal/runtime — Application Bootstrap
 *
 * Helper functions for managing the global HTML splash loader
 * defined in index.html as #global-loader.
 *
 * Usage in src/main.tsx:
 *   bootstrapApp() — sync call, kicks off async module loading internally
 *
 * Usage in Application.tsx:
 *   hideLoader() — call when initPhase transitions to 'initialized'
 *   showLoader() — call to restore the loader (e.g., during hard reloads)
 */

import { getRuntimeAdapter } from "@portal/shared-platform"
import { captureDeepLink } from "../deeplink"

declare global {
  interface Window {
    hideGlobalLoader?: () => void
  }
}

function getLoaderElement(): HTMLElement | null {
  if (typeof document === "undefined") return null
  return document.getElementById("global-loader")
}

/**
 * Hides the global splash loader (#global-loader) defined in index.html.
 * Triggers the portal-exit animation and removes the element from DOM.
 * Safe to call multiple times — guarded by .portal-active class.
 */
export function hideLoader(): void {
  if (typeof document === "undefined") return

  const loader = getLoaderElement()
  if (loader && !loader.classList.contains("portal-active")) {
    loader.classList.add("portal-active")
    // Hide after animation completes (1.8s + 0.1s delay = 1.9s)
    setTimeout(() => {
      loader.classList.remove("portal-active")
      loader.classList.add("hidden")
    }, 2000)
  }
}

/**
 * Programmatically shows the global loader if it was removed from DOM.
 * Useful for hard reloads or restore scenarios (rare case).
 * If #global-loader already exists — does nothing.
 */
export function showLoader(): void {
  if (typeof document === "undefined") return

  if (document.getElementById("global-loader")) {
    // Already present — remove hidden/portal-active states
    const loader = document.getElementById("global-loader")!
    loader.classList.remove("hidden", "portal-active")
    return
  }
}

/**
 * bootstrapApp — called at application entry point (src/main.tsx), after
 * `await initRuntime()` so the host is already known.
 *
 * Synchronous. Use for one-time setup: Sentry, feature flags, etc.
 * Module loading is configured separately via moduleRegistry.start(loader).
 */
export function bootstrapApp(): void {
  // Placeholder for future: Sentry init, version check, feature flags, etc.

  // Stash any launch deep link (startapp param, etc.) — resolved once
  // modules finish loading, see Application.tsx.
  captureDeepLink(getRuntimeAdapter().host)
}

;(window as any).showLoader = showLoader
;(window as any).hideLoader = hideLoader
