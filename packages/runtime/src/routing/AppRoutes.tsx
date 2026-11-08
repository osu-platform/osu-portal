/**
 * AppRoutes
 *
 * Renders the matched page for the current URL using `useRoutes()`.
 *
 * Responsibilities:
 * - Converts RouteConfig[] → RouteObject[] (react-router format)
 * - Wraps each page with GuardWrapper (access control) + Suspense (lazy loading)
 * - Returns the matched element (or null if no match)
 *
 * The runtime has no route table of its own: `routes` comes from the host
 * (portal shell or module-host) and `moduleRoutes` from the registry.
 * Layout is NOT handled here — the host wraps AppRoutes in a layout.
 */

import React, { useMemo } from "react"
import { useRoutes, type RouteObject } from "react-router-dom"

import { GuardWrapper } from "./GuardWrapper"
import type { RouteConfig } from "./types"

// ─── Page loader fallback ────────────────────────────────────────────────────

const PageLoader: React.FC = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      opacity: 0.4,
      fontSize: "15px",
      fontFamily: "Roboto, sans-serif",
    }}
  >
    Загрузка…
  </div>
)

// ─── Route builder ────────────────────────────────────────────────────────────

function buildRouteObjects(configs: RouteConfig[]): RouteObject[] {
  return configs.map((config): RouteObject => {
    const { path, component: PageComponent, element, meta, children } = config

    let pageElement: React.ReactNode

    if (PageComponent) {
      pageElement = (
        <React.Suspense fallback={<PageLoader />}>
          <PageComponent />
        </React.Suspense>
      )
    } else {
      pageElement = element ?? null
    }

    // Wrap in GuardWrapper for access control
    const guarded = <GuardWrapper meta={meta}>{pageElement}</GuardWrapper>

    return {
      path,
      element: guarded,
      children: children ? buildRouteObjects(children) : undefined,
    }
  })
}

// ─── AppRoutes component ─────────────────────────────────────────────────────

export interface AppRoutesProps {
  /** Routes owned by the host application (shell pages, host dashboard). */
  routes?: RouteConfig[]
  /** Routes contributed by registered modules. */
  moduleRoutes?: RouteConfig[]
}

const EMPTY: RouteConfig[] = []

export const AppRoutes: React.FC<AppRoutesProps> = ({
  routes = EMPTY,
  moduleRoutes = EMPTY,
}) => {
  // Module routes come first so a module can own a path the host also declares
  // as a catch-all; the host's "*" stays last.
  const routeObjects = useMemo(
    () => buildRouteObjects([...moduleRoutes, ...routes]),
    [routes, moduleRoutes]
  )

  return useRoutes(routeObjects)
}
