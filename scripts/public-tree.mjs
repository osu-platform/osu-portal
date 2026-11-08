/** Prepare the WHOLE public frontend without Git history. Never publishes. */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { execFileSync } from "node:child_process"
import { tmpdir } from "node:os"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const rootFiles = [
  "README.md",
  "LICENSE",
  "NOTICE",
  "THIRD_PARTY_NOTICES.md",
  "DEPENDENCY_NOTICES.md",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "tsconfig.base.json",
  "tsconfig.json",
  "tsconfig.node.json",
  "vitest.config.ts",
  "vitest.shims.d.ts",
  ".env.example",
  ".gitignore",
  ".eslintrc.cjs",
  ".eslintignore",
  ".nvmrc",
  ".prettierrc",
  ".prettierignore",
]
const trees = ["apps", "packages", ".storybook", "licenses", "docs/public"]
const scripts = [
  "scripts/create-module.mjs",
  "scripts/validate-modules.mjs",
  "scripts/tokens.test.mjs",
  "scripts/license-audit.mjs",
  "scripts/public-tree.mjs",
  "scripts/public-tree.test.mjs",
  "scripts/workspace.test.mjs",
  "scripts/lib/workspace.mjs",
  "scripts/lib/notices.mjs",
  "scripts/lib/demo-html.mjs",
  "scripts/templates",
]
const docs = [
  "docs/MODULE_GUIDE.md",
  "docs/ARCHITECTURE.md",
  "docs/CONTRIBUTING.md",
  "docs/ASSET_PROVENANCE.md",
  "docs/LICENSE_DECISION.md",
  "docs/dependency-licenses.json",
]
const skip = new Set([
  "node_modules",
  "dist",
  ".git",
  ".DS_Store",
  "coverage",
  "storybook-static",
])
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{40,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bsk-[A-Za-z0-9]{20,}\b/,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/,
]
const privateNames = ["@portal/modules-" + "events", "zazhi" + "gaem", "OEVNT-"]
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (skip.has(entry.name) || /\.(?:tsbuildinfo|log)$/.test(entry.name))
      return []
    const full = path.join(dir, entry.name)
    if (entry.isSymbolicLink())
      throw new Error(`Symlink forbidden in public tree: ${full}`)
    return entry.isDirectory() ? files(full) : [full]
  })
}
export function checkPublicTree(dir) {
  const findings = []
  for (const file of files(dir)) {
    const rel = path.relative(dir, file).split(path.sep).join("/")
    if (
      /(^|\/)(?:certs?|\.claude|\.codex|\.agents)(\/|$)|\.(?:pem|key|p12)$|(^|\/)\.env(?:\.|$)/.test(
        rel
      ) &&
      !rel.endsWith(".env.example")
    )
      findings.push({ file: rel, kind: "private-file" })
    if (
      rel.startsWith("packages/modules/") &&
      !rel.startsWith("packages/modules/schedule/")
    )
      findings.push({ file: rel, kind: "private-module" })
    const data = fs.readFileSync(file)
    if (data.includes(0)) continue
    const text = data.toString("utf8")
    if (secretPatterns.some((re) => re.test(text)))
      findings.push({ file: rel, kind: "secret-shaped-value" })
    if (
      rel !== "scripts/public-tree.mjs" &&
      privateNames.some((name) =>
        text.toLowerCase().includes(name.toLowerCase())
      )
    )
      findings.push({ file: rel, kind: "private-reference" })
    if (
      rel !== "scripts/public-tree.mjs" &&
      /(?:d5[a-z0-9]{15,}|max\.davg-team\.ru|25ИСТ\(б\)-1|Манаева)/.test(text)
    )
      findings.push({ file: rel, kind: "private-data-or-infrastructure" })
  }
  if (fs.existsSync(path.join(dir, ".git")))
    findings.push({ file: ".git", kind: "git-history" })
  return { files: files(dir).length, findings }
}
function copy(from, to) {
  if (!fs.existsSync(from))
    throw new Error(`Required public file missing: ${from}`)
  const stat = fs.lstatSync(from)
  if (stat.isSymbolicLink()) throw new Error(`Symlink forbidden: ${from}`)
  if (stat.isDirectory()) {
    if (from.split(path.sep).join('/').includes("/packages/shared/ui/.storybook")) return
    fs.mkdirSync(to, { recursive: true })
    for (const entry of fs.readdirSync(from))
      if (!skip.has(entry) && !/\.(?:tsbuildinfo|log)$/.test(entry))
        copy(path.join(from, entry), path.join(to, entry))
  } else {
    fs.mkdirSync(path.dirname(to), { recursive: true })
    // Internal task citations are comments, not public documentation references.
    const buffer = fs.readFileSync(from)
    fs.writeFileSync(
      to,
      !buffer.includes(0) && /\.(?:ts|tsx|js|mjs|css|md)$/.test(from)
        ? buffer
            .toString("utf8")
            .replace(/\s*\(OEVNT-\d+\)/g, "")
            .replace(/OEVNT-\d+/g, "internal change")
        : buffer
    )
  }
}
export function preparePublicTree(out) {
  const dest = path.resolve(out)
  if (dest === root || dest.startsWith(root + path.sep))
    throw new Error("Output must be outside source repository")
  if (fs.existsSync(dest) && fs.readdirSync(dest).length)
    throw new Error(
      "Output must be empty; existing files are never overwritten"
    )
  fs.mkdirSync(dest, { recursive: true })
  for (const rel of [...rootFiles, ...trees, ...scripts, ...docs])
    copy(path.join(root, rel), path.join(dest, rel))
  copy(path.join(root, "docs/public/README.md"), path.join(dest, "README.md"))
  for (const name of ["MODULE_GUIDE", "ARCHITECTURE", "CONTRIBUTING"])
    copy(
      path.join(root, `docs/public/${name}.md`),
      path.join(dest, `docs/${name}.md`)
    )
  // Root Storybook config is public; vendored old Storybook configs are excluded.
  copy(path.join(root, ".storybook"), path.join(dest, ".storybook"))
  fs.mkdirSync(path.join(dest, ".github/workflows"), { recursive: true })
  copy(
    path.join(root, ".github/workflows/checks.yaml"),
    path.join(dest, ".github/workflows/checks.yaml")
  )
  const result = checkPublicTree(dest)
  fs.writeFileSync(
    path.join(dest, "public-tree-audit.json"),
    JSON.stringify(result, null, 2) + "\n"
  )
  if (result.findings.length) throw new Error(JSON.stringify(result))
  return result
}
/** A prepared local repository must have exactly one root commit, never imported history. */
export function checkPublicRepository(dir) {
  const git = (...args) =>
    execFileSync("git", args, { cwd: dir, encoding: "utf8" }).trim()
  if (
    git("rev-list", "--all", "--count") !== "1" ||
    git("rev-list", "--parents", "-n", "1", "HEAD").split(" ").length !== 1
  )
    throw new Error("Expected one clean root commit across all refs")
  if (git("status", "--porcelain"))
    throw new Error(
      "Commit or discard prepared-tree changes before checking its archive"
    )
  const target = fs.mkdtempSync(path.join(tmpdir(), "portal-public-audit-"))
  try {
    const archive = execFileSync("git", ["archive", "--format=tar", "HEAD"], {
      cwd: dir,
      maxBuffer: 64 * 1024 * 1024,
    })
    execFileSync("tar", ["-xf", "-", "-C", target], { input: archive })
    return { ...checkPublicTree(target), rootCommit: git("rev-parse", "HEAD") }
  } finally {
    fs.rmSync(target, { recursive: true, force: true })
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const index = args.indexOf("--out")
  const check = args.indexOf("--check")
  const repository = args.indexOf("--check-repository")
  const result =
    repository >= 0
      ? checkPublicRepository(path.resolve(args[repository + 1] || root))
      : check >= 0
        ? checkPublicTree(path.resolve(args[check + 1] || root))
        : preparePublicTree(args[index + 1] || "../portal-public-ready")
  console.log(JSON.stringify(result, null, 2))
  process.exitCode = result.findings.length ? 1 : 0
}
