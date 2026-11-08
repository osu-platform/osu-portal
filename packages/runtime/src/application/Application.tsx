/**
 * @portal/runtime — Application Component
 *
 * Top-level UI component that bridges module loading, auth state, layout and
 * routing. It is shared verbatim by apps/portal and apps/module-host: if the
 * two ever bootstrapped differently, "a module debugged in the DevKit behaves
 * the same in the portal" would stop being true.
 *
 * The host injects what differs — its routes and its layout. Everything a host
 * does NOT supply defaults to the neutral runtime behaviour.
 *
 * Render branches:
 *   moduleStatus === 'idle'|'loading'    → null (modules loading, splash visible)
 *   moduleStatus === 'error'             → ErrorPage with retry
 *   initPhase === 'initializing'         → null (auth not ready, splash visible)
 *   otherwise                            → Layout + AppRoutes
 */

import React, { useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import type { DeepLinkResolver } from "@portal/shared-module-types"
import { useAuthState } from "../auth"
import { hideLoader } from "./bootstrap"
import { ErrorPage } from "../pages"
import { AppRoutes } from "../routing"
import type { RouteConfig } from "../routing"
import { moduleRegistry, useModuleStatus } from "../modules"
import { SimpleLayout } from "../layout/SimpleLayout"
import { consumePendingDeepLink, resolveDeepLink } from "../deeplink"
import type { ResolvedDeepLinkResolver } from "../deeplink"

export interface ApplicationProps {
  /** Routes owned by the host (shell pages, or the module-host dashboard). */
  routes?: RouteConfig[]
  /** Deep-link resolvers for host-owned pages, not tied to any module (e.g. portal settings). */
  coreDeepLinks?: DeepLinkResolver[]
  /** Layout wrapping the routed page. Defaults to the chrome-less layout. */
  layout?: React.ComponentType<{ children?: React.ReactNode }>
}

export const Application: React.FC<ApplicationProps> = ({
  routes = [],
  coreDeepLinks = [],
  layout: Layout = SimpleLayout,
}) => {
  const { initPhase } = useAuthState()
  const {
    status: moduleStatus,
    error: moduleError,
    retry: retryModules,
  } = useModuleStatus()
  const navigate = useNavigate()

  // Hide native HTML splash once both modules and auth are ready
  useEffect(() => {
    if (initPhase === "initialized" && moduleStatus === "ready") {
      hideLoader()
    }
  }, [initPhase, moduleStatus])

  // Once modules are registered, resolve any deep link captured at boot and
  // navigate there — at most once per launch (consumePendingDeepLink clears it).
  useEffect(() => {
    if (moduleStatus !== "ready") return

    const token = consumePendingDeepLink()
    if (!token) return

    const resolvers: ResolvedDeepLinkResolver[] = [
      ...moduleRegistry
        .getAll()
        .filter((m) => m.deepLink)
        .map((m) => ({
          prefix: m.deepLink!.prefix ?? m.slug,
          resolve: m.deepLink!.resolve,
        })),
      ...coreDeepLinks.map((r) => ({
        prefix: r.prefix ?? "app",
        resolve: r.resolve,
      })),
    ]

    const path = resolveDeepLink(token, resolvers)
    // Push, not replace: the app already landed on its default route (e.g.
    // dashboard) before this runs — replacing it would leave the deep-linked
    // page as the only history entry, with nowhere for "back" to go but out
    // of the app entirely.
    if (path) navigate(path)
  }, [moduleStatus, coreDeepLinks, navigate])

  // Recomputed when modules finish loading — that is when routes appear.
  const moduleRoutes = useMemo(
    () => (moduleStatus === "ready" ? moduleRegistry.getRoutes() : []),
    [moduleStatus]
  )

  // Show splash until modules are loaded and auth is initialized
  if (
    moduleStatus === "idle" ||
    moduleStatus === "loading" ||
    initPhase === "initializing"
  ) {
    return null
  }

  // Module loading failed — retry available
  if (moduleStatus === "error") {
    return <ErrorPage message={moduleError?.message} onRetry={retryModules} />
  }

  return (
    <Layout>
      <AppRoutes routes={routes} moduleRoutes={moduleRoutes} />
    </Layout>
  )
}
