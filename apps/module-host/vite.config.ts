import { defineConfig, loadEnv, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"
import path from "node:path"
import { execSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { workspaceAliases } from "../../scripts/lib/workspace.mjs"
import { licenseNotices } from "../../scripts/lib/notices.mjs"
import { demoHtml } from "../../scripts/lib/demo-html.mjs"

const repoRoot = path.resolve(__dirname, "..", "..")

/**
 * Branding — including the web manifest — comes from env, so a delivery is
 * re-branded by editing .env, not by patching files we would then have to
 * merge on the next release.
 */
function brandingManifest(env: Record<string, string>): Plugin {
  const name = env.VITE_APP_NAME || "Portal Module Host"
  return {
    name: "portal-branding-manifest",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "manifest.webmanifest",
        source: JSON.stringify(
          {
            name,
            short_name: env.VITE_APP_SHORT_NAME || name,
            description: env.VITE_APP_DESCRIPTION || "",
            start_url: "/",
            scope: "/",
            display: "standalone",
            background_color: env.VITE_APP_BG_COLOR || "#ffffff",
            theme_color: env.VITE_APP_THEME_COLOR || "#004F9F",
          },
          null,
          2
        ),
      })
    },
  }
}

/**
 * Version stamp of the slice this build came from.
 * `slice.json` is written by the exporter; inside the monorepo it is absent and
 * the git hash stands in.
 */
function sliceVersion(): string {
  const slicePath = path.join(repoRoot, "slice.json")
  if (existsSync(slicePath)) {
    try {
      const slice = JSON.parse(readFileSync(slicePath, "utf8"))
      return `${slice.profile}@${slice.sourceCommit ?? "unknown"}`
    } catch {
      return "unknown"
    }
  }
  try {
    return execSync("git rev-parse --short HEAD", { cwd: repoRoot })
      .toString()
      .trim()
  } catch {
    return "unknown"
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, "VITE_")

  return {
    plugins: [
      licenseNotices(repoRoot),
      react(),
      demoHtml(env),
      tsconfigPaths({ root: repoRoot }),
      brandingManifest(env),
    ],
    define: {
      __GIT_HASH__: JSON.stringify(sliceVersion()),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      __SLICE_VERSION__: JSON.stringify(sliceVersion()),
    },
    resolve: {
      // Derived from what is on disk: an exported slice simply has fewer
      // packages, and nothing here has to be edited for it.
      alias: workspaceAliases(repoRoot),
      dedupe: [
        "react",
        "react-dom",
        "react-router-dom",
        "@tanstack/react-query",
        "@portal/module-sdk",
      ],
    },
    envDir: repoRoot,
    server: {
      host: "localhost",
      port: 5174,
      // Same-origin proxy to the events backend: without it every call is
      // cross-origin and dies on CORS preflight, because the deployed allowlist
      // cannot know each developer's dev origin. The DevKit normally runs on
      // fixtures, but this lets it be pointed at the real backend too.
      proxy: {
        "/events-api": {
          target: env.VITE_EVENTS_API_UPSTREAM || "http://127.0.0.1:8000/api",
          changeOrigin: true,
          secure: true,
          rewrite: (p: string) => p.replace(/^\/events-api/, ""),
        },
      },
    },
    preview: { port: 5174 },
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  }
})
