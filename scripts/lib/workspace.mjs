/**
 * Workspace introspection shared by the Vite configs, the module validator and
 * the exporter.
 *
 * Aliases and TS path mappings are derived from what is actually on disk, not
 * maintained by hand. That is what makes an exported slice work without anyone
 * editing config files: the slice simply contains fewer packages.
 */

import { readdirSync, existsSync, readFileSync, statSync } from "node:fs"
import { join, resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))

/** Repository root (two levels up from scripts/lib). */
export const repoRoot = resolve(here, "..", "..")

/** Globs of the workspace, in the order pnpm-workspace.yaml declares them. */
const PACKAGE_DIRS = [
  "apps",
  "packages",
  "packages/shared",
  "packages/modules",
]

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"))
}

/**
 * @typedef {Object} WorkspacePackage
 * @property {string} name        npm name, e.g. "@portal/shared-ui"
 * @property {string} dir         absolute directory
 * @property {string} relDir      directory relative to the root
 * @property {string|null} srcDir absolute src directory, when present
 * @property {object} manifest    parsed package.json
 */

/** All workspace packages found under `root`. */
export function listWorkspacePackages(root = repoRoot) {
  /** @type {WorkspacePackage[]} */
  const packages = []
  const seen = new Set()

  for (const group of PACKAGE_DIRS) {
    const groupDir = join(root, group)
    if (!existsSync(groupDir)) continue

    for (const entry of readdirSync(groupDir)) {
      const dir = join(groupDir, entry)
      if (!statSync(dir).isDirectory()) continue
      const manifestPath = join(dir, "package.json")
      if (!existsSync(manifestPath)) continue
      if (seen.has(dir)) continue
      seen.add(dir)

      const manifest = readJson(manifestPath)
      if (!manifest.name) continue

      const srcDir = join(dir, "src")
      packages.push({
        name: manifest.name,
        dir,
        relDir: dir.slice(root.length + 1).split("\\").join("/"),
        srcDir: existsSync(srcDir) ? srcDir : null,
        manifest,
      })
    }
  }

  return packages.sort((a, b) => a.name.localeCompare(b.name))
}

/** Module packages only (packages/modules/*). */
export function listModulePackages(root = repoRoot) {
  return listWorkspacePackages(root).filter((p) =>
    p.relDir.startsWith("packages/modules/")
  )
}

/**
 * Vite `resolve.alias` entries for every workspace package that has a src/.
 *
 * Subpath exports declared in package.json (e.g. "./mock") get their own entry
 * so `@portal/module-sdk/mock` resolves without a bundler plugin.
 */
export function workspaceAliases(root = repoRoot) {
  /** @type {Record<string, string>} */
  const alias = {}

  for (const pkg of listWorkspacePackages(root)) {
    if (!pkg.srcDir) continue
    if (pkg.relDir.startsWith("apps/")) continue

    const exportsField = pkg.manifest.exports
    if (exportsField && typeof exportsField === "object") {
      for (const [subpath, target] of Object.entries(exportsField)) {
        if (subpath === ".") continue
        const file = typeof target === "string" ? target : target?.default
        if (typeof file !== "string") continue
        alias[`${pkg.name}${subpath.slice(1)}`] = resolve(pkg.dir, file)
      }
    }

    alias[pkg.name] = pkg.srcDir
  }

  return alias
}

/** The same mapping in tsconfig `paths` form, relative to the root. */
export function workspaceTsPaths(root = repoRoot) {
  /** @type {Record<string, string[]>} */
  const paths = {}
  for (const [name, target] of Object.entries(workspaceAliases(root))) {
    paths[name] = [target.slice(root.length + 1).split("\\").join("/")]
  }
  return paths
}
