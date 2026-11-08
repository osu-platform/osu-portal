/**
 * Deep links for portal-only pages — ones no module owns (settings,
 * dashboard, profile). Claims the reserved "app" prefix: a launch token like
 * "app_settings" resolves here, not in a module's registry.
 *
 * See @portal/shared-module-types (DeepLinkResolver) for the token format.
 */

import type { DeepLinkResolver } from "@portal/shared-module-types"
import { PATHS } from "./paths"

export const portalDeepLinks: DeepLinkResolver[] = [
  {
    prefix: "app",
    resolve(rest) {
      switch (rest) {
        case "settings":
          return PATHS.settings
        case "profile":
          return PATHS.profile
        case "dashboard":
          return PATHS.dashboard
        default:
          return null
      }
    },
  },
]
