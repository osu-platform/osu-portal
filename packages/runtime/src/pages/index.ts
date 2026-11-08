/**
 * @portal/runtime/pages
 *
 * System pages every host needs regardless of what it delivers: a crash
 * screen, a 404 and an inline access denial. Portal-specific pages (home,
 * settings, onboarding, auth) belong to the portal application and never ship
 * with an isolated delivery.
 */

export { ErrorPage } from "./ErrorPage"
export type { ErrorPageProps } from "./ErrorPage"
export { AccessDeniedPage } from "./AccessDeniedPage"
export { NotFoundPage } from "./NotFoundPage"
