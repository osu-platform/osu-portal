/**
 * @portal/shell
 *
 * The portal storefront: the module catalogue home page, portal settings,
 * onboarding, the auth pages and the navigation between modules.
 *
 * PERIMETER: internal. This package is never exported to a DevKit or a
 * delivery — it is the part of the product whose reproducibility we protect
 * (docs/DEVKIT_CONCEPT.md §1, §3.1). The exporter refuses to copy it, and the
 * leak guard fails the release if a trace of it appears in a slice.
 */

export { portalRoutes } from "./routes"
export { PATHS, PORTAL_REDIRECT_POLICY } from "./paths"
export { portalDeepLinks } from "./deeplinks"

export { HomePage } from "./home"
export { SettingsPage } from "./settings"
export { NotFoundRoute } from "./not-found/NotFoundRoute"

export { AuthLayout, MainLayout, OnboardingLayout } from "./layout"
export type {
  AuthLayoutProps,
  MainLayoutProps,
  OnboardingLayoutProps,
} from "./layout"

export {
  ThemePreferenceContext,
  useThemePreference,
  useThemePreferenceState,
} from "./settings/useThemePreference"
export type { ThemePreferenceContextValue } from "./settings/useThemePreference"
