/**
 * lazyPage — helper for lazy-loaded route components
 *
 * Supports both default and named exports.
 * Suspense is applied externally (AppRoutes in core).
 *
 * Usage with named export:
 *   lazyPage(() => import('../pages/SchedulePage'), 'SchedulePage')
 *
 * Usage with default export:
 *   lazyPage(() => import('../pages/LoginPage'))
 */

import React from "react"

 
type AnyModule = Record<string, any>
type ModuleLoader<M extends AnyModule> = () => Promise<M>

export function lazyPage<M extends AnyModule>(
  loader: ModuleLoader<M>,
  exportName?: keyof M
): React.LazyExoticComponent<React.ComponentType> {
  return React.lazy(() =>
    loader().then((mod) => ({
      default: exportName
        ? mod[exportName]
        : (mod as unknown as { default: React.ComponentType }).default,
    }))
  )
}
