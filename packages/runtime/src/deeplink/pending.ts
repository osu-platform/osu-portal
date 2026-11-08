/**
 * Holds the raw deep-link token captured at boot (see capture.ts) until
 * modules are ready to resolve it (see Application.tsx). A module-level
 * singleton, not React state — it must survive the render tree not existing
 * yet when the token is captured.
 */
let pendingToken: string | null = null

export function setPendingDeepLink(token: string | null): void {
  pendingToken = token
}

/** Reads and clears the pending token — resolution runs at most once per launch. */
export function consumePendingDeepLink(): string | null {
  const token = pendingToken
  pendingToken = null
  return token
}
