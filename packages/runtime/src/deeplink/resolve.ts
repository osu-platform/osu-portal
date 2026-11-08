import type { DeepLinkResolver } from "@portal/shared-module-types"

/** A resolver with its prefix already settled (module.deepLink.prefix ?? module.slug). */
export interface ResolvedDeepLinkResolver {
  prefix: string
  resolve: DeepLinkResolver["resolve"]
}

/**
 * Splits "<prefix>_<rest>" and hands `rest` to the matching resolver.
 * Returns null if the token is malformed, no resolver claims the prefix, or
 * the resolver itself doesn't recognize `rest`.
 */
export function resolveDeepLink(
  token: string,
  resolvers: ResolvedDeepLinkResolver[]
): string | null {
  const separatorIndex = token.indexOf("_")
  if (separatorIndex <= 0) return null

  const prefix = token.slice(0, separatorIndex)
  const rest = token.slice(separatorIndex + 1)
  if (!rest) return null

  const resolver = resolvers.find((r) => r.prefix === prefix)
  return resolver?.resolve(rest) ?? null
}
