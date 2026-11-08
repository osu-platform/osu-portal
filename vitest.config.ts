/// <reference types="vitest/config" />
import { defineConfig } from "vite"
import path from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin"
import { playwright } from "@vitest/browser-playwright"
import { workspaceAliases } from "./scripts/lib/workspace.mjs"

/**
 * Test/Storybook configuration lives here, not in an app's vite.config.
 *
 * An exported slice must not carry Storybook, Vitest and Playwright with it —
 * that would be extra weight and extra dependencies for a recipient who only
 * wants to build the app (docs/DEVKIT_CONCEPT.md §8, item 10).
 */

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tsconfigPaths({ root: dirname })],
  resolve: { alias: workspaceAliases(dirname) },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          // The vendored UI kit's tests rely on globals; keeping them enabled
          // means those tests run here instead of quietly never running.
          globals: true,
          include: ["scripts/**/*.test.mjs", "packages/**/*.test.ts"],
        },
      },
    ],
  },
})
