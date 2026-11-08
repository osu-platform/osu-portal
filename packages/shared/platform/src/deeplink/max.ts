import { getMaxWebApp } from "../adapters/max/detectPlatform"
import type { DeepLinkAdapter } from "./types"

/**
 * MAX's Mini App launch params mirror Telegram's shape:
 * `window.WebApp.initDataUnsafe.start_param`.
 */
export const createMaxDeepLinkAdapter = (): DeepLinkAdapter => ({
  getStartParam() {
    return getMaxWebApp()?.initDataUnsafe?.start_param ?? null
  },
})
