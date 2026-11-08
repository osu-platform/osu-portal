import {
  mkdtempSync,
  rmSync,
  appendFileSync,
  mkdirSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { spawnSync } from "node:child_process"
import { it, expect } from "vitest"
it("creates and validates an external module and rejects a prefix-sharing neighbour import", () => {
  const dir = mkdtempSync(join(tmpdir(), "portal-external-tool-"))
  try {
    const module = join(dir, "probe")
    const run = (script, ...args) =>
      spawnSync(process.execPath, [resolve("scripts", script), ...args], {
        encoding: "utf8",
      })
    expect(run("create-module.mjs", "probe", "--out", module).status).toBe(0)
    expect(run("validate-modules.mjs", "--dir", module).status).toBe(0)
    mkdirSync(join(dir, "probe-neighbour"))
    writeFileSync(join(dir, "probe-neighbour/index.ts"), "export default 1\n")
    appendFileSync(
      join(module, "src/index.ts"),
      '\nimport neighbour from "../../probe-neighbour/index"\nvoid neighbour\n'
    )
    const result = run("validate-modules.mjs", "--dir", module)
    expect(result.status).toBe(1)
    expect(result.stdout).toContain("escapes the module directory")
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
