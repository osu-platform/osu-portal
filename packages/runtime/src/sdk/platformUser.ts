/**
 * Reading the embedding platform's user identity.
 *
 * This is the ONE place in the codebase allowed to touch `window.WebApp` /
 * `window.Telegram` for identity purposes — everything else goes through the
 * SDK. `validate-modules` enforces that no module does it.
 */

import { getMaxWebApp, getTelegramWebApp } from "@portal/shared-platform"
import type { HostType } from "@portal/shared-platform"
import type { SdkPlatform } from "@portal/module-sdk"

export interface PlatformIdentity {
  platform: SdkPlatform
  platformUserId: string | null
  firstName: string | null
  lastName: string | null
}

const EMPTY: PlatformIdentity = {
  platform: "web",
  platformUserId: null,
  firstName: null,
  lastName: null,
}

function readMaxIdentity(): PlatformIdentity {
  const webApp = getMaxWebApp() as
    | (ReturnType<typeof getMaxWebApp> & {
        initDataManager?: {
          initDataUnsafe?: { user?: Record<string, unknown> }
        }
      })
    | null
  if (!webApp) return { ...EMPTY, platform: "max" }

  // MAX SDK v2 (desktop) uses initDataManager; v1 (mobile) exposes
  // initDataUnsafe directly. Both shapes are in the wild.
  const user = (webApp.initDataManager?.initDataUnsafe?.user ??
    webApp.initDataUnsafe?.user) as
    | { id?: number | string; first_name?: string; last_name?: string }
    | undefined

  return {
    platform: "max",
    platformUserId: user?.id != null ? String(user.id) : null,
    firstName: user?.first_name ?? null,
    lastName: user?.last_name ?? null,
  }
}

function readTelegramIdentity(): PlatformIdentity {
  const tg = getTelegramWebApp() as
    | (ReturnType<typeof getTelegramWebApp> & {
        initDataUnsafe?: {
          user?: { id?: number; first_name?: string; last_name?: string }
        }
      })
    | null
  const user = tg?.initDataUnsafe?.user
  return {
    platform: "telegram",
    platformUserId: user?.id != null ? String(user.id) : null,
    firstName: user?.first_name ?? null,
    lastName: user?.last_name ?? null,
  }
}

export function hostTypeToPlatform(host: HostType): SdkPlatform {
  switch (host) {
    case "max":
      return "max"
    case "telegram":
      return "telegram"
    case "capacitor":
      return "capacitor"
    case "pwa":
      return "pwa"
    case "browser":
      return "web"
    default:
      return "unknown"
  }
}

/** Best-effort identity from the embedding platform. Never throws. */
export function readPlatformIdentity(host: HostType): PlatformIdentity {
  try {
    if (host === "max") return readMaxIdentity()
    if (host === "telegram") return readTelegramIdentity()
  } catch {
    // A messenger SDK that misbehaves must not take the app down — the module
    // simply sees a guest.
  }
  return { ...EMPTY, platform: hostTypeToPlatform(host) }
}
