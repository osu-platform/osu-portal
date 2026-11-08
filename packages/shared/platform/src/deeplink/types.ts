/**
 * Deep link start-param extraction — one adapter per host, mirroring the
 * runtime adapters in ../adapters. Kept separate from RuntimeAdapter so
 * adding a host here doesn't force every existing adapter factory to grow
 * a new required field.
 */
export interface DeepLinkAdapter {
  /** Raw, unparsed launch token (e.g. Telegram/MAX start_param), or null if none was passed. */
  getStartParam(): string | null
}
