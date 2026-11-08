#!/usr/bin/env node
/**
 * create-module — scaffolds a new module.
 *
 * The scaffold is deliberately runnable the moment it is created: a page, a
 * route, a widget, fixtures and a manifest that declares the SDK contract. A
 * contributor's first action should be `pnpm dev:host` and seeing their module,
 * not wiring boilerplate.
 *
 * Usage:
 *   node scripts/create-module.mjs <id> [--title "Название"] [--force]
 *
 *   id — kebab-case, becomes @portal/modules-<id> and the /<id> route.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs"
import { join, dirname, resolve, relative } from "node:path"
import { repoRoot } from "./lib/workspace.mjs"

const TEMPLATE_DIR = join(repoRoot, "scripts/templates/module")

/** template file → destination, relative to the new module directory. */
const FILES = [
  ["package.json.tmpl", "package.json"],
  ["tsconfig.json.tmpl", "tsconfig.json"],
  ["README.md.tmpl", "README.md"],
  ["src/index.ts.tmpl", "src/index.ts"],
  ["src/module.config.tsx.tmpl", "src/module.config.tsx"],
  ["src/routes.tsx.tmpl", "src/routes.tsx"],
  ["src/pages/Page.tsx.tmpl", "src/pages/__MODULE_PASCAL__Page.tsx"],
  ["src/widgets/Widget.tsx.tmpl", "src/widgets/__MODULE_PASCAL__Widget.tsx"],
  ["src/mocks/handlers.ts.tmpl", "src/mocks/handlers.ts"],
]

function fail(message) {
  console.error(`✗ ${message}`)
  process.exit(1)
}

function toPascal(id) {
  return id
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("")
}

function hostContractVersion() {
  const file = join(repoRoot, "packages/shared/module-sdk/src/version.ts")
  const match = /CONTRACT_VERSION\s*=\s*["']([^"']+)["']/.exec(
    readFileSync(file, "utf8")
  )
  return match ? match[1] : "1.0.0"
}

function render(template, vars) {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.split(key).join(value),
    template
  )
}

function main() {
  const args = process.argv.slice(2)
  const id = args.find((a) => !a.startsWith("--"))
  const force = args.includes("--force")
  const titleIndex = args.indexOf("--title")
  const title = titleIndex !== -1 ? args[titleIndex + 1] : null

  if (!id) {
    console.error('Usage: pnpm create-module <id> [--title "Название"]')
    process.exit(2)
  }

  if (!/^[a-z][a-z0-9-]*$/.test(id)) {
    fail(
      `"${id}" is not a valid module id — use kebab-case, e.g. "campus-map". ` +
        "The id becomes the package name and the route, so it cannot be fixed later without a rename."
    )
  }

  const outIndex = args.indexOf("--out")
  const targetDir =
    outIndex >= 0
      ? resolve(args[outIndex + 1])
      : join(repoRoot, "packages/modules", id)
  if (existsSync(targetDir) && !force) {
    fail(`packages/modules/${id} already exists (use --force to overwrite)`)
  }

  const pascal = toPascal(id)
  const vars = {
    __MODULE_ID__: id,
    __MODULE_PASCAL__: pascal,
    __MODULE_TITLE__: title ?? pascal,
    __CONTRACT_VERSION__: hostContractVersion(),
    __BASE_TSCONFIG__: relative(targetDir, join(repoRoot, "tsconfig.base.json"))
      .split("\\")
      .join("/"),
  }

  for (const [source, destination] of FILES) {
    const template = readFileSync(join(TEMPLATE_DIR, source), "utf8")
    const outPath = join(targetDir, render(destination, vars))
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, render(template, vars))
  }

  console.log(`✓ Модуль создан: ${targetDir}\n`)
  console.log("Дальше:")
  console.log("  1. pnpm install")
  console.log(
    "  2. pnpm dev:host        # хост на моках, http://localhost:5174"
  )
  console.log(`  3. откройте /${id}`)
  console.log("  4. pnpm validate-modules")
  console.log(
    "\nЧтобы модуль попал в полный портал, добавьте его в композиционный корень:"
  )
  console.log("  packages/composition/src/index.ts")
}

main()
