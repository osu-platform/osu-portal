/**
 * Theme Presets
 *
 * Заготовленные темы, которые пользователь выбирает в настройках.
 *
 * Все значения проверены на контраст WCAG 2.1 AA: см. utils/contrast.ts
 * и тест presets.test.ts. Менять цвета можно, но тест обязан оставаться зелёным —
 * иначе плейсхолдеры и подсказки снова станут нечитаемыми.
 */

import type { PortalTheme } from "./types"

/**
 * Светлая — нейтральная системная тема
 */
export const lightTheme: PortalTheme = {
  id: "light",
  name: "Светлая",
  tokens: {
    scheme: "light",

    bgPrimary: "#ffffff",
    bgSecondary: "#f2f2f7",
    bgElevated: "#f0f0f0",

    textPrimary: "#000000",
    textSecondary: "#55595e",
    textTertiary: "#64686c",
    textAccent: "#0a6ca8",
    textDanger: "#c62828",

    borderDefault: "#8b8b90",
    borderSubtle: "#e3e3e8",
    divider: "#d6d6dc",

    accent: "#0a6ca8",
    link: "#0a6ca8",

    actionPrimaryBg: "#0a6ca8",
    actionPrimaryText: "#ffffff",
    actionDangerBg: "#c62828",
    actionDangerText: "#ffffff",

    surfaceSection: "#ffffff",
    surfaceHeader: "#f2f2f7",
    surfaceTabbar: "#ffffff",

    success: "#2e7d32",
    warning: "#96591a",
    destructive: "#c62828",
  },
}

/**
 * Тёмная — тема по умолчанию
 */
export const darkTheme: PortalTheme = {
  id: "dark",
  name: "Тёмная",
  tokens: {
    scheme: "dark",

    bgPrimary: "#212121",
    bgSecondary: "#181818",
    bgElevated: "#2c2c2c",

    textPrimary: "#ffffff",
    textSecondary: "#b4b4b4",
    textTertiary: "#9d9d9d",
    textAccent: "#7cc0f7",
    textDanger: "#ff8a80",

    borderDefault: "#707070",
    borderSubtle: "#333333",
    divider: "#3a3a3a",

    accent: "#7cc0f7",
    link: "#7cc0f7",

    actionPrimaryBg: "#7cc0f7",
    actionPrimaryText: "#00131f",
    actionDangerBg: "#b3261e",
    actionDangerText: "#ffffff",

    surfaceSection: "#212121",
    surfaceHeader: "#1a1a1a",
    surfaceTabbar: "#1a1a1a",

    success: "#81c784",
    warning: "#ffb74d",
    destructive: "#ff8a80",
  },
}

/**
 * Полночь — глубокий AMOLED с фиолетовым акцентом
 */
export const midnightTheme: PortalTheme = {
  id: "midnight",
  name: "Полночь",
  tokens: {
    scheme: "dark",

    bgPrimary: "#0d0d0f",
    bgSecondary: "#141418",
    bgElevated: "#1e1e26",

    textPrimary: "#ece8f5",
    textSecondary: "#aaa2c0",
    textTertiary: "#9990ad",
    textAccent: "#c7b3e8",
    textDanger: "#ff8a80",

    borderDefault: "#6a6280",
    borderSubtle: "#26222f",
    divider: "#2a2535",

    accent: "#c7b3e8",
    link: "#c7b3e8",

    actionPrimaryBg: "#b39ddb",
    actionPrimaryText: "#12071f",
    actionDangerBg: "#b3261e",
    actionDangerText: "#ffffff",

    surfaceSection: "#0d0d0f",
    surfaceHeader: "#0a0a0c",
    surfaceTabbar: "#0a0a0c",

    success: "#80cbc4",
    warning: "#ffcc80",
    destructive: "#ff8a80",
  },
}

/**
 * Латте — тёплый кремовый светлый
 */
export const latteTheme: PortalTheme = {
  id: "latte",
  name: "Латте",
  tokens: {
    scheme: "light",

    bgPrimary: "#fdf6ee",
    bgSecondary: "#f2e8da",
    bgElevated: "#fffbf6",

    textPrimary: "#2c1e0f",
    textSecondary: "#6b4f34",
    textTertiary: "#77593b",
    textAccent: "#8a4f10",
    textDanger: "#a3271b",

    borderDefault: "#9b7d5c",
    borderSubtle: "#ecdec8",
    divider: "#dcc8b0",

    accent: "#8a4f10",
    link: "#8a4f10",

    actionPrimaryBg: "#8a4f10",
    actionPrimaryText: "#ffffff",
    actionDangerBg: "#a3271b",
    actionDangerText: "#ffffff",

    surfaceSection: "#fffbf6",
    surfaceHeader: "#f2e8da",
    surfaceTabbar: "#fffbf6",

    success: "#2f6b33",
    warning: "#8a5a10",
    destructive: "#a3271b",
  },
}

/**
 * Норд — холодный арктический
 */
export const nordTheme: PortalTheme = {
  id: "nord",
  name: "Норд",
  tokens: {
    scheme: "dark",

    bgPrimary: "#2e3440",
    bgSecondary: "#262c38",
    bgElevated: "#3b4252",

    textPrimary: "#eceff4",
    textSecondary: "#bac2d2",
    textTertiary: "#a6b0c2",
    textAccent: "#9fd0de",
    textDanger: "#e79aa2",

    borderDefault: "#8791a5",
    borderSubtle: "#3b4252",
    divider: "#434c5e",

    accent: "#9fd0de",
    link: "#9fd0de",

    actionPrimaryBg: "#9fd0de",
    actionPrimaryText: "#10202a",
    actionDangerBg: "#8f2f38",
    actionDangerText: "#eceff4",

    surfaceSection: "#2e3440",
    surfaceHeader: "#242933",
    surfaceTabbar: "#242933",

    success: "#a3be8c",
    warning: "#ebcb8b",
    destructive: "#e79aa2",
  },
}

/**
 * Все доступные пресеты (порядок = порядок в настройках)
 */
export const presets: PortalTheme[] = [
  darkTheme,
  lightTheme,
  midnightTheme,
  nordTheme,
  latteTheme,
]

/**
 * Найти пресет по идентификатору
 */
export function getPreset(id: string): PortalTheme | undefined {
  return presets.find((preset) => preset.id === id)
}

/**
 * Идентификатор темы по умолчанию
 */
export const DEFAULT_THEME_ID = "dark"

/**
 * Тема по умолчанию
 */
export function getDefaultTheme(): PortalTheme {
  return darkTheme
}

/**
 * Пресет по умолчанию для конкретной схемы.
 *
 * Нужен платформам, которые сообщают только схему без палитры
 * (браузер через prefers-color-scheme, мессенджер MAX через color-scheme).
 */
export function getDefaultThemeForScheme(scheme: "light" | "dark"): PortalTheme {
  return scheme === "light" ? lightTheme : darkTheme
}
