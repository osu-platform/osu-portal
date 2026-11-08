/**
 * Color utilities
 *
 * Разбор цвета, относительная яркость и контраст по WCAG 2.1.
 * Используется валидатором пресетов и выводом производных токенов.
 */

export interface Rgb {
  r: number
  g: number
  b: number
}

/**
 * Разобрать hex-цвет (#rgb, #rrggbb) в компоненты 0..255
 *
 * @throws если строка не является поддерживаемым hex-цветом
 */
export function parseHex(hex: string): Rgb {
  const value = hex.trim().replace(/^#/, "")

  if (value.length === 3) {
    const [r, g, b] = value.split("")
    return {
      r: parseInt(r + r, 16),
      g: parseInt(g + g, 16),
      b: parseInt(b + b, 16),
    }
  }

  if (value.length === 6) {
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16),
    }
  }

  throw new Error(`Не hex-цвет: "${hex}"`)
}

/** Собрать hex-строку из компонентов (значения зажимаются в 0..255) */
export function toHex({ r, g, b }: Rgb): string {
  const channel = (value: number) =>
    Math.round(Math.min(255, Math.max(0, value)))
      .toString(16)
      .padStart(2, "0")

  return `#${channel(r)}${channel(g)}${channel(b)}`
}

/** Является ли строка hex-цветом, который мы умеем разбирать */
export function isHex(value: string): boolean {
  return /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())
}

/**
 * Относительная яркость по WCAG 2.1
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function relativeLuminance(color: string | Rgb): number {
  const { r, g, b } = typeof color === "string" ? parseHex(color) : color

  const linear = (channel: number) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }

  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

/**
 * Коэффициент контраста двух цветов по WCAG 2.1 (от 1 до 21)
 */
export function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground)
  const l2 = relativeLuminance(background)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/** Тёмный ли цвет (используется для выбора направления осветления) */
export function isDarkColor(color: string): boolean {
  return relativeLuminance(color) < 0.5
}

/**
 * Осветлить (percent > 0) или затемнить (percent < 0) цвет на процент
 *
 * Прямолинейный сдвиг по каналам — этого достаточно для вывода
 * недостающих токенов из неполной темы платформы.
 */
export function adjustColor(hex: string, percent: number): string {
  const { r, g, b } = parseHex(hex)
  const amount = Math.round(2.55 * percent)

  return toHex({ r: r + amount, g: g + amount, b: b + amount })
}

/**
 * Подобрать цвет текста (чёрный или белый), который контрастнее на данном фоне
 */
export function pickReadableText(background: string): string {
  return contrastRatio("#ffffff", background) >=
    contrastRatio("#000000", background)
    ? "#ffffff"
    : "#000000"
}
