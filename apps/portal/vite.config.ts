import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"
import path from "node:path"
import { existsSync, readFileSync } from "node:fs"
import { execSync } from "node:child_process"
import { workspaceAliases } from "../../scripts/lib/workspace.mjs"
import { licenseNotices } from "../../scripts/lib/notices.mjs"
import { demoHtml } from "../../scripts/lib/demo-html.mjs"

const repoRoot = path.resolve(__dirname, "..", "..")
const CERT_FILE = path.join(repoRoot, "certificate.pem")

/**
 * Dev server config.
 *
 * Default: plain http://localhost:3000 — works on a fresh clone with no
 * setup and no elevated privileges (`pnpm dev`).
 * HTTPS on the messenger-facing host (port 443, needs `sudo`) is opt-in via
 * `pnpm dev:https`, since Telegram/MAX WebViews refuse to load an http://
 * mini app.
 */
/**
 * Same-origin proxies to the backends the app talks to in dev.
 *
 * Without these every call is cross-origin and dies on CORS preflight, since
 * the deployed allowlist cannot know each developer's dev origin. Proxying
 * keeps the browser on one origin, so CORS never enters the picture and no
 * production config has to change to let someone test locally.
 */
function devProxy() {
  const eventsUpstream =
    process.env.VITE_EVENTS_API_UPSTREAM || "http://127.0.0.1:8000/api"

  return {
    "/events-api": {
      target: eventsUpstream,
      changeOrigin: true,
      secure: true,
      rewrite: (p: string) => p.replace(/^\/events-api/, ""),
    },
  }
}

function resolveDevServer() {
  if (process.env.VITE_HTTPS !== "1") {
    return { host: "localhost", port: 3000, proxy: devProxy() }
  }

  if (!existsSync(CERT_FILE)) {
    throw new Error(
      `VITE_HTTPS=1 requires ${CERT_FILE} — see docs for how to generate it.`
    )
  }

  const cert = readFileSync(CERT_FILE)
  return {
    host: "localhost.osuplatform.ru",
    port: 443,
    allowedHosts: true as const,
    https: { cert, key: cert },
    proxy: devProxy(),
  }
}

function getGitHash(): string {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: repoRoot })
      .toString()
      .trim()
  } catch {
    return "unknown"
  }
}

export default defineConfig(({ command, mode }) => {
  const isDevServer = command === "serve"
  const env = loadEnv(mode, repoRoot, "VITE_")

  return {
    plugins: [
      licenseNotices(repoRoot),
      react(),
      demoHtml(env),
      tsconfigPaths({ root: repoRoot }),
    ],
    define: {
      __GIT_HASH__: JSON.stringify(getGitHash()),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    },
    resolve: {
      // Aliases are derived from the workspace, never hand-maintained:
      // a build contains exactly the packages that are on disk.
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
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
    server: isDevServer ? resolveDevServer() : undefined,
  }
})
