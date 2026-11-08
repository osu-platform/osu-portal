/**
 * Contract version of @portal/module-sdk.
 *
 * This is a public API with external consumers (DevKit contributors, delivery
 * recipients), so the version is part of the contract, not decoration.
 *
 * Policy (see docs/MODULE_GUIDE.md §Версионирование):
 * - MAJOR — breaking change: something was removed or changed shape.
 *           Modules built against an older major are refused by the host.
 * - MINOR — additive change: new fields/methods. Old modules keep working.
 * - PATCH — behaviour fix, no surface change.
 *
 * A module declares the contract it was written against via
 * `IModule.contractVersion`. The host compares it with CONTRACT_VERSION.
 */
export const CONTRACT_VERSION = "1.2.0"

export interface SemVer {
  major: number
  minor: number
  patch: number
}

export function parseSemVer(version: string): SemVer | null {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version.trim())
  if (!match) return null
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  }
}

export interface CompatibilityResult {
  compatible: boolean
  reason?: string
}

/**
 * Is a module requiring `required` runnable on a host providing `host`?
 *
 * Compatible when the major versions match and the host is not older than the
 * module in minor version (the module may rely on fields a newer minor added).
 */
export function checkContractCompatibility(
  required: string,
  host: string = CONTRACT_VERSION
): CompatibilityResult {
  const a = parseSemVer(required)
  const b = parseSemVer(host)

  if (!a) {
    return {
      compatible: false,
      reason: `module declares an unparseable contract version "${required}"`,
    }
  }
  if (!b) {
    return {
      compatible: false,
      reason: `host declares an unparseable contract version "${host}"`,
    }
  }
  if (a.major !== b.major) {
    return {
      compatible: false,
      reason: `module requires contract ${a.major}.x, host provides ${b.major}.x`,
    }
  }
  if (a.minor > b.minor) {
    return {
      compatible: false,
      reason: `module requires contract ${required}, host provides only ${host}`,
    }
  }
  return { compatible: true }
}
