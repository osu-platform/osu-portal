/**
 * @portal/shared-config
 *
 * Central runtime configuration for the portal.
 * All external endpoints live here — modules must not hardcode URLs.
 *
 * Values are overridable per environment via Vite env vars (see .env.example).
 */

type EnvRecord = Record<string, string | undefined>

const env: EnvRecord =
  (typeof import.meta !== "undefined" &&
    (import.meta as unknown as { env?: EnvRecord }).env) ||
  {}

/** Upstream events backend. The dev server proxies to it — see below. */
export const EVENTS_API_UPSTREAM =
  "/events-api"

/** Path the dev-server proxy listens on. Must match the vite configs. */
export const EVENTS_API_DEV_PROXY = "/events-api"

/**
 * In dev the events API is addressed through a same-origin path.
 *
 * The mini app is served from localhost.osuplatform.ru while the API lives on a
 * Yandex gateway, so every call is cross-origin and dies on preflight unless
 * that exact dev origin is in the deployed CORS allowlist — which would mean a
 * redeploy for every machine that wants to test. Routing through the dev
 * server's proxy makes the browser see one origin and removes CORS from the
 * picture entirely, without touching production config.
 */
const isDevServer = Boolean(
  (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV
)

const EVENTS_API_FALLBACK = isDevServer
  ? EVENTS_API_DEV_PROXY
  : EVENTS_API_UPSTREAM

export interface PortalConfig {
  /** Main platform API (auth, profile, etc.) */
  apiBaseUrl: string
  /** Schedule subscriptions/preferences backend */
  scheduleApiUrl: string
  /** Proxy for the legacy osu.ru schedule pages */
  schedulePagesUrl: string
  /** Public schedule site the app links out to (share / "open original") */
  scheduleSiteUrl: string
  /** iCal export service for schedule subscriptions */
  calendarExportUrl: string
  /** Events module backend (osu-events) */
  eventsApiUrl: string
  /**
   * Staff/organizer frontend for the events module (osu-events, `frontend/`) —
   * where "Открыть админку" sends a user with editor/department access.
   * Scoped to the events module, not a portal-wide address.
   */
  eventsAdminUrl: string
}

export const config: PortalConfig = {
  apiBaseUrl: env.VITE_API_BASE_URL || "/api",
  scheduleApiUrl:
    env.VITE_OSU_SCHEDULE_URL ||
    "/schedule-api",
  schedulePagesUrl:
    env.VITE_SCHEDULE_PAGES_URL || "/schedule-pages",
  scheduleSiteUrl: env.VITE_SCHEDULE_SITE_URL || "http://osu.ru/pages/schedule/",
  calendarExportUrl:
    env.VITE_CALENDAR_EXPORT_URL || "/calendar",
  eventsApiUrl: env.VITE_EVENTS_API_URL || EVENTS_API_FALLBACK,
  // Same host as the events API, admin app served at the root instead of /api —
  // override with VITE_EVENTS_ADMIN_URL once the staff frontend's real address differs.
  eventsAdminUrl: env.VITE_EVENTS_ADMIN_URL || EVENTS_API_FALLBACK.replace(/\/api$/, "/manage"),
}
