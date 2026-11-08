/**
 * GuardWrapper
 *
 * Wraps a route's page component and enforces access control.
 * Placed inside AppRoutes, which renders inside a Layout chosen by Application:
 *
 *   Application → Layout (by authState) → AppRoutes → GuardWrapper → Suspense → Page
 *
 * Access denied behaviour:
 * - unauthenticated trying to access protected route → redirect to /login
 *   (after login the user navigates where they want)
 * - onboarding state trying to access authenticated route → redirect to /onboarding
 * - authenticated trying to access guest-only route → redirect to /dashboard
 * - insufficient permissions → show inline AccessDenied, NOT a redirect
 *   (so the user stays on the URL; refreshing or getting permissions resolves it naturally)
 */

import React from "react"
import { Navigate } from "react-router-dom"
import { useAuthState } from "../auth"
import { AccessDeniedPage } from "../pages"
import { quickCheckAccess } from "./guards"
import type { RouteMeta } from "./types"

interface GuardWrapperProps {
  meta?: RouteMeta
  children: React.ReactNode
}

export const GuardWrapper: React.FC<GuardWrapperProps> = ({
  meta,
  children,
}) => {
  const { authState } = useAuthState()

  const { allowed, redirectTo } = quickCheckAccess(authState, meta)

  if (!allowed) {
    // redirectTo is set — user needs a different auth state (login / onboarding)
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />
    }
    // No redirect — show inline denial (permissions check, stays on same URL)
    return <AccessDeniedPage />
  }

  return <>{children}</>
}
