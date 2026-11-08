/**
 * Root ESLint config for the portal monorepo.
 *
 * packages/shared/ui is a vendored UI kit with its own tooling —
 * it is excluded via .eslintignore and keeps its local config.
 */

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  plugins: ["@typescript-eslint", "react-hooks", "react-refresh"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:storybook/recommended",
    "prettier",
  ],
  rules: {
    // Providers/index files legitimately export hooks alongside components
    "react-refresh/only-export-components": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
    "no-empty": ["error", { allowEmptyCatch: true }],
    // Pragmatic for now — tighten gradually
    "@typescript-eslint/no-explicit-any": "off",
  },
  overrides: [
    {
      files: ["*.cjs", "*.js"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
}
