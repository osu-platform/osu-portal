/**
 * @portal/runtime/application
 *
 * Application bootstrap and initialization.
 *
 * Exports:
 * - Application — root UI component (layout + routes + system states)
 * - bootstrapApp — call at main.tsx before rendering React tree
 * - hideLoader — hides the HTML splash (#global-loader)
 * - showLoader — shows / restores the HTML splash
 */

export { Application } from "./Application"
export type { ApplicationProps } from "./Application"
export { bootstrapApp, hideLoader, showLoader } from "./bootstrap"
