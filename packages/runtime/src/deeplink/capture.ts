import type { HostType } from "@portal/shared-platform"
import { getDeepLinkStartParam } from "@portal/shared-platform"
import { setPendingDeepLink } from "./pending"

/** Reads the launch deep-link token for the given host and stashes it for later resolution. */
export function captureDeepLink(host: HostType): void {
  setPendingDeepLink(getDeepLinkStartParam(host))
}
