import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
/** Retain licenses in production artifacts as well as in source distributions. */
export function licenseNotices(root) {
  return {
    name: "portal-license-notices",
    generateBundle() {
      const files = [
        "LICENSE",
        "NOTICE",
        "THIRD_PARTY_NOTICES.md",
        "DEPENDENCY_NOTICES.md",
        "packages/shared/ui/LICENSE",
        ...readdirSync(join(root, "licenses")).map(
          (name) => "licenses/" + name
        ),
      ]
      for (const file of files)
        this.emitFile({
          type: "asset",
          fileName: "legal/" + file,
          source: readFileSync(join(root, file), "utf8"),
        })
    },
  }
}
