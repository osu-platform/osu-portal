/**
 * Deep Link Contract
 *
 * A deep link arrives as a single opaque token (the shape messenger launch
 * params force on us — Telegram/MAX start params only allow
 * [A-Za-z0-9_-]): "<prefix>_<rest>". `prefix` identifies who owns the link
 * (a module's slug, or the reserved "app" prefix for portal-only pages —
 * see @portal/shell). `rest` is handed to that owner's resolver verbatim;
 * its shape is entirely up to the owner (an id, a sub-page keyword, etc).
 */
export interface DeepLinkResolver {
  /**
   * Token prefix this resolver answers to. For a module-declared resolver,
   * defaults to the module's `slug` — set this only to claim a different
   * prefix than the slug.
   */
  prefix?: string

  /**
   * `rest` is the token remainder after "<prefix>_".
   * Return an in-app path to navigate to, or null if not recognized.
   */
  resolve(rest: string): string | null
}
