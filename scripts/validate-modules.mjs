#!/usr/bin/env node
/**
 * validate-modules — enforces the module boundary.
 *
 * The promise "a module developed against the DevKit drops into the portal
 * unchanged" cannot rest on discipline: it has to be a check that fails CI.
 * This is that check.
 *
 * Rules (docs/DEVKIT_CONCEPT.md §6):
 *  1. A module imports only shared/*, @portal/module-sdk and declared external
 *     dependencies — never the runtime, the shell, an app or another module.
 *  2. A module never touches platform globals (window.WebApp, window.Telegram);
 *     identity and environment come from the SDK.
 *  3. A module never hardcodes an external URL — those come from config.
 *  4. A module exports a createModule() factory returning a valid IModule.
 *  5. The contract version a module declares is one the host can satisfy.
 *  6. A module's imports are declared in its package.json.
 *
 * Usage:
 *   node scripts/validate-modules.mjs [--json] [--module <name>]
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs"
import { dirname, join, relative, resolve, sep } from "node:path"
import { listModulePackages, repoRoot } from "./lib/workspace.mjs"

// ─── Rule data ───────────────────────────────────────────────────────────────

/** Packages a module may never import, whatever the reason. */
const FORBIDDEN_PACKAGES = [
  "@portal/runtime",
  "@portal/shell",
  "@portal/core", // legacy name — must not come back
  "@portal/app-portal",
  "@portal/app-module-host",
]

const FORBIDDEN_GLOBALS = [
  { pattern: /\bwindow\s*(\.|\[["'])\s*WebApp\b/, name: "window.WebApp" },
  { pattern: /\bwindow\s*(\.|\[["'])\s*Telegram\b/, name: "window.Telegram" },
  {
    pattern: /\(\s*window\s+as\s+any\s*\)\s*\.\s*(WebApp|Telegram)\b/,
    name: "window.WebApp / window.Telegram via `as any`",
  },
]

/** URL literals that are allowed to appear in module source. */
const URL_ALLOWLIST = [
  /^https?:\/\/(localhost|127\.0\.0\.1)/,
  /^https?:\/\/(www\.)?w3\.org/, // SVG namespaces
  /^https?:\/\/mock\.local/, // fixtures
]

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"])

// ─── Helpers ─────────────────────────────────────────────────────────────────

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist") continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      walk(full, files)
    } else if (SOURCE_EXTENSIONS.has(entry.slice(entry.lastIndexOf(".")))) {
      files.push(full)
    }
  }
  return files
}

/** Strip comments and string bodies we do not want to scan for URLs. */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1")
}

function lineOf(source, index) {
  return source.slice(0, index).split("\n").length
}

const IMPORT_RE =
  /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)|require\s*\(\s*["']([^"']+)["']\s*\)/g

function collectImports(source) {
  const specifiers = []
  let match
  while ((match = IMPORT_RE.exec(source)) !== null) {
    const spec = match[1] ?? match[2] ?? match[3]
    if (spec) specifiers.push({ spec, index: match.index })
  }
  return specifiers
}

/** Bare package name from a specifier ("@scope/pkg/sub" → "@scope/pkg"). */
function packageName(spec) {
  if (spec.startsWith(".") || spec.startsWith("/")) return null
  const parts = spec.split("/")
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]
}

// ─── Checks ──────────────────────────────────────────────────────────────────

function checkImports(pkg, file, source, violations) {
  const declared = new Set([
    ...Object.keys(pkg.manifest.dependencies ?? {}),
    ...Object.keys(pkg.manifest.peerDependencies ?? {}),
    ...Object.keys(pkg.manifest.devDependencies ?? {}),
  ])

  for (const { spec, index } of collectImports(source)) {
    const name = packageName(spec)
    const at = `${relative(repoRoot, file)}:${lineOf(source, index)}`

    if (!name) {
      // Relative import — fine inside the module, never outside it.
      const target = resolve(dirname(file), spec)
      if (target !== pkg.dir && !target.startsWith(pkg.dir + sep)) {
        violations.push({
          rule: "boundary",
          at,
          message: `relative import "${spec}" escapes the module directory`,
        })
      }
      continue
    }

    if (FORBIDDEN_PACKAGES.includes(name)) {
      violations.push({
        rule: "boundary",
        at,
        message: `imports "${name}" — modules may only use shared/*, @portal/module-sdk and their own dependencies`,
      })
      continue
    }

    if (name.startsWith("@portal/modules-") && name !== pkg.name) {
      violations.push({
        rule: "boundary",
        at,
        message: `imports another module ("${name}") — modules must be independent`,
      })
      continue
    }

    // Node built-ins have no business in a browser module either.
    if (name.startsWith("node:")) {
      violations.push({
        rule: "boundary",
        at,
        message: `imports Node built-in "${spec}" — modules run in the browser`,
      })
      continue
    }

    if (!declared.has(name) && name !== pkg.name) {
      violations.push({
        rule: "undeclared-dependency",
        at,
        message: `imports "${name}", which is not declared in package.json`,
      })
    }
  }
}

function checkGlobals(pkg, file, source, violations) {
  const code = stripComments(source)
  for (const { pattern, name } of FORBIDDEN_GLOBALS) {
    const match = pattern.exec(code)
    if (match) {
      violations.push({
        rule: "platform-globals",
        at: `${relative(repoRoot, file)}:${lineOf(code, match.index)}`,
        message: `touches ${name} directly — use @portal/module-sdk (useSdkUser / useSdkEnvironment) instead`,
      })
    }
  }
}

function checkUrls(pkg, file, source, violations) {
  const code = stripComments(source)
  const urlRe = /["'`](https?:\/\/[^"'`\s]+)["'`]/g
  let match
  while ((match = urlRe.exec(code)) !== null) {
    const url = match[1]
    if (URL_ALLOWLIST.some((allowed) => allowed.test(url))) continue
    violations.push({
      rule: "hardcoded-url",
      at: `${relative(repoRoot, file)}:${lineOf(code, match.index)}`,
      message: `hardcodes "${url}" — endpoints belong in @portal/shared-config and reach the module via sdk.config`,
    })
  }
}

function checkFactory(pkg, files, violations) {
  const entry = ["src/index.ts", "src/index.tsx"]
    .map((rel) => join(pkg.dir, rel))
    .find((candidate) => existsSync(candidate))

  if (!entry) {
    violations.push({
      rule: "contract",
      at: relative(repoRoot, pkg.dir),
      message: "has no src/index.ts — a module must have a single entry point",
    })
    return
  }

  const entrySource = readFileSync(entry, "utf8")
  if (!/\bcreateModule\b/.test(entrySource)) {
    violations.push({
      rule: "contract",
      at: relative(repoRoot, entry),
      message:
        "does not export createModule() — the host cannot instantiate it",
    })
  }

  // The factory must produce something IModule-shaped. A full type check is
  // the compiler's job; here we catch the fields the host reads at runtime.
  const factoryFile = files.find((f) => /module\.config\.[jt]sx?$/.test(f))
  if (factoryFile) {
    const source = readFileSync(factoryFile, "utf8")
    for (const field of ["name", "version"]) {
      if (!new RegExp(`\\b${field}\\s*:`).test(source)) {
        violations.push({
          rule: "contract",
          at: relative(repoRoot, factoryFile),
          message: `module factory does not set "${field}"`,
        })
      }
    }
  }
}

function checkContractVersion(pkg, hostContract, violations) {
  const declared =
    pkg.manifest.portal?.module?.contractVersion ??
    pkg.manifest.portal?.contractVersion ??
    null

  if (!declared) {
    violations.push({
      rule: "contract-version",
      at: relative(repoRoot, join(pkg.dir, "package.json")),
      severity: "warning",
      message:
        "does not declare portal.module.contractVersion — the host cannot tell which SDK contract it was built against",
    })
    return
  }

  const [major, minor] = declared.split(".").map(Number)
  const [hostMajor, hostMinor] = hostContract.split(".").map(Number)

  if (major !== hostMajor || minor > hostMinor) {
    violations.push({
      rule: "contract-version",
      at: relative(repoRoot, join(pkg.dir, "package.json")),
      message: `requires SDK contract ${declared}, host provides ${hostContract}`,
    })
  }
}

function readHostContractVersion() {
  const file = join(repoRoot, "packages/shared/module-sdk/src/version.ts")
  const match = /CONTRACT_VERSION\s*=\s*["']([^"']+)["']/.exec(
    readFileSync(file, "utf8")
  )
  if (!match) {
    throw new Error("Cannot read CONTRACT_VERSION from @portal/module-sdk")
  }
  return match[1]
}

// ─── Entry point ─────────────────────────────────────────────────────────────

function validateModule(pkg, hostContract) {
  const violations = []
  const files = walk(join(pkg.dir, "src"))

  for (const file of files) {
    const source = readFileSync(file, "utf8")
    // Stories and tests are development artefacts: they are not part of what
    // ships, so their tooling imports are not the module's dependencies.
    if (!/\.(stories|test|spec)\.[jt]sx?$/.test(file)) {
      checkImports(pkg, file, source, violations)
    }
    checkGlobals(pkg, file, source, violations)
    checkUrls(pkg, file, source, violations)
  }

  checkFactory(pkg, files, violations)
  checkContractVersion(pkg, hostContract, violations)

  return { module: pkg.name, dir: pkg.relDir, files: files.length, violations }
}

function main() {
  const args = process.argv.slice(2)
  const asJson = args.includes("--json")
  const only = args.includes("--module")
    ? args[args.indexOf("--module") + 1]
    : null

  const hostContract = readHostContractVersion()
  const externalDirs = args.flatMap((arg, i) =>
    arg === "--dir" ? [resolve(args[i + 1])] : []
  )
  let modules = externalDirs.length
    ? externalDirs.map((dir) => {
        const manifest = JSON.parse(
          readFileSync(join(dir, "package.json"), "utf8")
        )
        return {
          name: manifest.name,
          dir,
          relDir: relative(repoRoot, dir),
          manifest,
        }
      })
    : listModulePackages()
  if (only) {
    modules = modules.filter(
      (m) => m.name === only || m.name === `@portal/modules-${only}`
    )
    if (modules.length === 0) {
      console.error(`No module matches "${only}"`)
      process.exit(2)
    }
  }

  const results = modules.map((pkg) => validateModule(pkg, hostContract))
  const errors = results.flatMap((r) =>
    r.violations
      .filter((v) => v.severity !== "warning")
      .map((v) => ({ ...v, module: r.module }))
  )
  const warnings = results.flatMap((r) =>
    r.violations
      .filter((v) => v.severity === "warning")
      .map((v) => ({ ...v, module: r.module }))
  )

  if (asJson) {
    console.log(
      JSON.stringify(
        { hostContract, results, ok: errors.length === 0 },
        null,
        2
      )
    )
    process.exit(errors.length === 0 ? 0 : 1)
  }

  console.log(`Проверка границ модулей (контракт SDK ${hostContract})\n`)
  for (const result of results) {
    const failed = result.violations.filter((v) => v.severity !== "warning")
    const mark = failed.length === 0 ? "✓" : "✗"
    console.log(`${mark} ${result.module} — ${result.files} файлов`)
  }

  if (warnings.length > 0) {
    console.log("\nПредупреждения:")
    for (const w of warnings) {
      console.log(`  · [${w.rule}] ${w.module}: ${w.message}\n    ${w.at}`)
    }
  }

  if (errors.length > 0) {
    console.log("\nНарушения:")
    for (const e of errors) {
      console.log(`  ✗ [${e.rule}] ${e.module}: ${e.message}\n    ${e.at}`)
    }
    console.log(
      `\n${errors.length} нарушени(й). Правила: docs/MODULE_GUIDE.md §Границы модуля.`
    )
    process.exit(1)
  }

  console.log("\nВсе модули соблюдают границы.")
}

main()
