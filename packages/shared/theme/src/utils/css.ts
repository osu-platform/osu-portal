/**
 * CSS Variable Management
 *
 * Единственное место, где токены темы превращаются в CSS-переменные.
 *
 * Важно: сюда попадают ТОЛЬКО цвета из пресета. Производные значения
 * (полупрозрачные заливки, состояния hover/active, скелетоны, оверлеи)
 * вычисляются в CSS через color-mix — см. packages/shared/ui/src/styles/tokens.css.
 * Так их не нужно дублировать в каждом пресете и они автоматически
 * подстраиваются под тему платформы.
 */

import type { ThemeTokens } from "../types"
import { TOKEN_KEYS } from "../types"

/**
 * Префикс всех переменных темы
 */
const PREFIX = "--p-"

/** camelCase → kebab-case */
function toKebab(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

/**
 * Соответствие ключей токенов именам CSS-переменных.
 *
 * Строится из TOKEN_KEYS, поэтому рассинхрон невозможен:
 * `bgPrimary` → `--p-color-bg-primary`, `scheme` → `--p-color-scheme`.
 */
export const TOKEN_MAP = Object.fromEntries(
  TOKEN_KEYS.map((key) => [key, `${PREFIX}color-${toKebab(key)}`])
) as Record<keyof ThemeTokens, string>

/**
 * Записать токены темы в CSS-переменные на <html>
 */
export function injectThemeVariables(tokens: ThemeTokens): void {
  // SSR: DOM недоступен
  if (typeof document === "undefined") {
    return
  }

  const root = document.documentElement

  for (const key of TOKEN_KEYS) {
    const cssVar = TOKEN_MAP[key]
    const value = tokens[key]

    if (cssVar && value) {
      root.style.setProperty(cssVar, value)
    }
  }

  // Нативные элементы браузера (скроллбары, автозаполнение, date picker)
  root.style.setProperty("color-scheme", tokens.scheme)

  // Атрибут для CSS-селекторов, которым нужна ветка по схеме,
  // и для отладки: видно в инспекторе, какая схема применена
  root.dataset.pScheme = tokens.scheme
}

/**
 * Прочитать текущие значения токенов из DOM
 */
export function getCurrentThemeVariables(): ThemeTokens | null {
  if (typeof document === "undefined") {
    return null
  }

  const computedStyle = getComputedStyle(document.documentElement)
  const tokens: Partial<Record<keyof ThemeTokens, string>> = {}

  for (const key of TOKEN_KEYS) {
    const value = computedStyle.getPropertyValue(TOKEN_MAP[key]).trim()

    if (value) {
      tokens[key] = value
    }
  }

  return tokens as ThemeTokens
}

/**
 * Имя CSS-переменной для токена
 */
export function getCSSVariable(tokenKey: keyof ThemeTokens): string {
  return TOKEN_MAP[tokenKey]
}
