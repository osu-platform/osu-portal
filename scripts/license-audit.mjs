import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const virtual = path.join(root, "node_modules/.pnpm")
const rows = []
const lock = fs.readFileSync(path.join(root, "pnpm-lock.yaml"), "utf8")
const active = new Set(
  [
    ...lock.matchAll(/^  '?(@[^/\s]+\/[^@\s']+|[^@\s':]+)@([^:\s']+)'?:$/gm),
  ].map((m) => m[1] + "@" + m[2])
)
function inspect(dir) {
  const file = path.join(dir, "package.json")
  if (!fs.existsSync(file)) return
  const pkg = JSON.parse(fs.readFileSync(file, "utf8"))
  if (!active.has(pkg.name + "@" + pkg.version)) return
  const license =
    typeof pkg.license === "object" ? pkg.license?.type : pkg.license
  const texts = fs
    .readdirSync(dir)
    .filter(
      (f) =>
        /^(licen[sc]e|copying|notice)(\.|$)/i.test(f) &&
        fs.statSync(path.join(dir, f)).isFile()
    )
    .map((f) => ({ file: f, text: fs.readFileSync(path.join(dir, f), "utf8") }))
  rows.push({
    name: pkg.name,
    version: pkg.version,
    license: license ?? "UNKNOWN",
    texts,
  })
}
for (const entry of fs.readdirSync(virtual, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name === "node_modules") continue
  const modules = path.join(virtual, entry.name, "node_modules")
  if (!fs.existsSync(modules)) continue
  for (const pkg of fs.readdirSync(modules, { withFileTypes: true })) {
    if (!pkg.isDirectory() || pkg.isSymbolicLink()) continue
    const dir = path.join(modules, pkg.name)
    if (pkg.name.startsWith("@")) {
      for (const child of fs.readdirSync(dir, { withFileTypes: true }))
        if (child.isDirectory() && !child.isSymbolicLink())
          inspect(path.join(dir, child.name))
    } else inspect(dir)
  }
}
const unique = [
  ...new Map(rows.map((r) => [r.name + "@" + r.version, r])).values(),
].sort((a, b) => a.name.localeCompare(b.name))
const report = {
  packages: unique.map(({ texts, ...r }) => r),
  review: unique
    .filter(
      (r) =>
        !/^(MIT|ISC|Apache-2.0|BSD-[23]-Clause|0BSD|CC0-1.0|CC-BY-4.0|Unlicense|BlueOak-1.0.0)$/.test(
          r.license
        )
    )
    .map(({ texts, ...r }) => r),
}
const dest = process.argv[2] || path.join(root, "docs/dependency-licenses.json")
fs.writeFileSync(dest, JSON.stringify(report, null, 2) + "\n")
if (process.argv.includes("--notices")) {
  const intro =
    "# Third-party dependency notices\n\nGenerated from the installed lockfile dependency tree, including development tools. Individual licenses remain applicable. Vendored source notices are in THIRD_PARTY_NOTICES.md.\n\n"
  fs.writeFileSync(
    path.join(root, "DEPENDENCY_NOTICES.md"),
    intro +
      unique
        .map(
          (r) =>
            `## ${r.name}@${r.version} — ${r.license}\n\n` +
            r.texts
              .map(
                (t) =>
                  `### ${t.file}\n\n\x60\x60\x60text\n${t.text}\n\x60\x60\x60\n`
              )
              .join("\n")
        )
        .join("\n")
  )
}
console.log(
  JSON.stringify({ packages: unique.length, review: report.review }, null, 2)
)
