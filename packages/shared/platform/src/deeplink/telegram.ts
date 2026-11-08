import { getTelegramWebApp } from "../adapters/telegram/detectPlatform"
import type { DeepLinkAdapter } from "./types"

/**
 * Telegram passes the deep-link token as `start_param` inside
 * `initDataUnsafe` — set when the Mini App is opened via a `t.me/.../app?startapp=...` link.
 */
export const createTelegramDeepLinkAdapter = (): DeepLinkAdapter => ({
  getStartParam() {
    return getTelegramWebApp()?.initDataUnsafe?.start_param ?? null
  },
})
