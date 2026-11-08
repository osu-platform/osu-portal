/**
 * Host configuration — the one file the exporter regenerates per delivery.
 *
 * `profile` decides which SDK implementation backs the app:
 *   "mock" — fixtures, offline, no credentials (DevKit);
 *   "live" — the real runtime SDK against configured endpoints (delivery).
 *
 * `showDevDashboard` decides whether the start page is a contributor's bench
 * or a plain entry into the module.
 */

export type DataProfile = "mock" | "live"

const env = import.meta.env

export const HOST_CONFIG = {
  /** Product name shown in the UI. Parameterised per delivery. */
  appName: (env.VITE_APP_NAME as string | undefined) ?? "Portal Module Host",

  profile: ((env.VITE_DATA_PROFILE as string | undefined) === "live"
    ? "live"
    : "mock") as DataProfile,

  /**
   * Debug affordances on the start page. On by default in dev builds, off in
   * production builds unless explicitly forced — a delivery must not ship an
   * environment switcher to end users.
   */
  showDevDashboard:
    (env.VITE_DEV_DASHBOARD as string | undefined) === "true" ||
    ((env.VITE_DEV_DASHBOARD as string | undefined) !== "false" && env.DEV),

  /** Where the start page sends the user when they open the module. */
  moduleEntryPath: (env.VITE_MODULE_ENTRY as string | undefined) ?? null,
} as const
