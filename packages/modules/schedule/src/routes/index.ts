import type { RouteConfig } from "@portal/shared-module-types"
import { lazyPage } from "@portal/shared-lib"

const SchedulePlaceholder = lazyPage(
  () => import("../pages/SchedulePlaceholder"),
  "SchedulePlaceholder"
)

const SchedulePage = lazyPage(
  () => import("../pages/SchedulePage"),
  "SchedulePage"
)

const routes: RouteConfig[] = [
  {
    path: "/schedule/:type/:id/:view",
    component: SchedulePage,
    meta: { guard: "public" },
  },
  {
    path: "/schedule",
    component: SchedulePlaceholder,
    meta: { guard: "public" },
  },
]

export default routes
