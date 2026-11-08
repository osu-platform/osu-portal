/**
 * Theme Package
 *
 * Семантическая система тем: принимает тему от платформы или выбор
 * пользователя и раскладывает её в CSS-переменные `--p-*`.
 */

// Types
export type {
  ColorScheme,
  ThemeTokens,
  PortalTheme,
  ThemeMode,
  UserThemeConfig,
  RuntimeThemeInput,
} from "./types"
export { TOKEN_KEYS, COLOR_TOKEN_KEYS } from "./types"

// Presets
export {
  lightTheme,
  darkTheme,
  midnightTheme,
  nordTheme,
  latteTheme,
  presets,
  getPreset,
  getDefaultTheme,
  getDefaultThemeForScheme,
  DEFAULT_THEME_ID,
} from "./presets"

// Provider and hook
export { ThemeProvider, useTheme } from "./provider"

// CSS-переменные
export {
  injectThemeVariables,
  getCurrentThemeVariables,
  getCSSVariable,
  TOKEN_MAP,
} from "./utils/css"

// Нормализация тем платформ
export {
  normalizeRuntimeTheme,
  detectSystemScheme,
  getHostDeclaredScheme,
  deriveTokens,
} from "./utils/normalize"

// Разрешение приоритетов
export { resolveTheme, getThemeInfo } from "./utils/resolver"

// Работа с цветом
export {
  parseHex,
  toHex,
  isHex,
  relativeLuminance,
  contrastRatio,
  isDarkColor,
  adjustColor,
  pickReadableText,
} from "./utils/color"

// Проверка контраста
export {
  CONTRAST_RULES,
  THRESHOLDS,
  findContrastViolations,
} from "./utils/contrast"
export type {
  ContrastRule,
  ContrastKind,
  ContrastViolation,
} from "./utils/contrast"

// Validation utilities
export { isValidUserThemeConfig, isValidThemeTokens } from "./types"
