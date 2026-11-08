import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  symlinkSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, it, expect } from "vitest"
import { checkPublicTree } from "./public-tree.mjs"
function fixture(run) {
  const dir = mkdtempSync(join(tmpdir(), "public-guard-"))
  try {
    run(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}
describe("whole public frontend guard", () => {
  it("rejects a private module even with an innocent manifest", () =>
    fixture((dir) => {
      mkdirSync(join(dir, "packages/modules/private-addon"), {
        recursive: true,
      })
      writeFileSync(
        join(dir, "packages/modules/private-addon/package.json"),
        "{}"
      )
      expect(
        checkPublicTree(dir).findings.some((f) => f.kind === "private-module")
      ).toBe(true)
    }))
  it("checks certificate contents, hidden files and history", () =>
    fixture((dir) => {
      mkdirSync(join(dir, ".git"))
      writeFileSync(join(dir, ".env.local"), "TOKEN=hidden")
      writeFileSync(
        join(dir, "certificate.pem"),
        "-----BEGIN " + "PRIVATE KEY-----"
      )
      const kinds = checkPublicTree(dir).findings.map((f) => f.kind)
      expect(kinds).toContain("git-history")
      expect(kinds).toContain("private-file")
      expect(kinds).toContain("secret-shaped-value")
    }))
  it("rejects symlinks rather than following private files", () =>
    fixture((dir) => {
      symlinkSync("/outside/private", join(dir, "link"))
      expect(() => checkPublicTree(dir)).toThrow("Symlink")
    }))
  it("permits the full shell, runtime and SDK", () =>
    fixture((dir) => {
      mkdirSync(join(dir, "packages/shell"), { recursive: true })
      writeFileSync(
        join(dir, "packages/shell/package.json"),
        "@portal/shell @portal/runtime @portal/module-sdk"
      )
      expect(checkPublicTree(dir).findings).toEqual([])
    }))
})
