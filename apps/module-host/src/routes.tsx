/**
 * Routes owned by the isolated host.
 *
 * Just two: the start page and a 404. Everything else the app can show comes
 * from the registered modules — the host does not know their paths.
 */

import { lazyPage, NotFoundPage, type RouteConfig } from "@portal/runtime"

const DashboardPage = lazyPage(
  () => import("./dashboard/DashboardPage"),
  "DashboardPage"
)

export const hostRoutes: RouteConfig[] = [
  {
    path: "/",
    component: DashboardPage,
    meta: { guard: "public", title: "Главная" },
  },
  {
    path: "*",
    element: <NotFoundPage />,
    meta: { guard: "public", title: "Страница не найдена" },
  },
]
