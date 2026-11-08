/**
 * Theme Normalization
 *
 * Превращает сырые данные платформы в полный набор семантических токенов.
 *
 * Поддерживаемые источники:
 * - Telegram Mini Apps — присылает палитру themeParams (snake_case) и схему;
 * - Мессенджер MAX — сообщает только схему (color-scheme на документе);
 * - Браузер — только схему (prefers-color-scheme);
 * - Пользовательский выбор — наш пресет целиком, нормализация не нужна.
 *
 * Ключевой принцип: платформа почти всегда присылает НЕПОЛНУЮ палитру.
 * Всё, чего не хватает, выводится из того, что пришло (deriveTokens),
 * а не берётся из чужой темы — иначе получаются нечитаемые смеси.
 */

import type { RuntimeThemeInput, ThemeTokens, ColorScheme } from "../types"
import { getDefaultThemeForScheme } from "../presets"
import { adjustColor, isHex, contrastRatio, pickReadableText } from "./color"

/**
 * Взять первое значение, которое является пригодным hex-цветом.
 *
 * Платформы регулярно присылают пустые строки и мусор вместо цвета,
 * а `""` прошёл бы обычную проверку на undefined и сломал бы палитру.
 */
function firstColor(...values: (string | undefined)[]): string | undefined {
  return values.find((value) => typeof value === "string" && isHex(value))
}

/**
 * Достроить полный набор токенов из неполного.
 *
 * Каждый недостающий токен выводится по цепочке:
 * явное значение → родственный токен → вычисление из фона → значение пресета.
 */
export function deriveTokens(
  partial: Partial<ThemeTokens>,
  scheme: ColorScheme
): ThemeTokens {
  const base = getDefaultThemeForScheme(scheme).tokens
  const isDark = scheme === "dark"

  // Направление «сдвига» поверхности: в тёмной теме приподнятое — светлее,
  // в светлой — темнее
  const elevate = (color: string, amount: number) =>
    isHex(color) ? adjustColor(color, isDark ? amount : -amount) : color

  const bgPrimary = firstColor(partial.bgPrimary) ?? base.bgPrimary
  const bgSecondary = firstColor(partial.bgSecondary) ?? base.bgSecondary
  const textPrimary = firstColor(partial.textPrimary) ?? base.textPrimary
  const surfaceSection = firstColor(partial.surfaceSection) ?? bgPrimary
  const accent = firstColor(partial.accent, partial.link, partial.textAccent) ?? base.accent
  const actionPrimaryBg = firstColor(partial.actionPrimaryBg, partial.accent) ?? accent
  const actionDangerBg =
    firstColor(partial.actionDangerBg, partial.destructive) ??
    base.actionDangerBg

  /**
   * Приподнятая поверхность обязана отличаться от основного фона — на ней
   * держатся карточки, выпадающие списки и поля ввода.
   *
   * Мало взять присланное значение: Telegram отдаёт section_bg_color, равный
   * bg_color, и тогда поверхность нужно приподнять самим, иначе границы
   * карточек и списков пропадают.
   */
  const proposedElevated = firstColor(partial.bgElevated)
  const bgElevated =
    proposedElevated && proposedElevated !== bgPrimary
      ? proposedElevated
      : elevate(bgPrimary, 6)

  return {
    scheme,

    // --- Фоны -------------------------------------------------------------
    bgPrimary,
    bgSecondary,
    bgElevated,

    // --- Текст ------------------------------------------------------------
    textPrimary,
    textSecondary: firstColor(partial.textSecondary) ?? base.textSecondary,
    textTertiary:
      firstColor(partial.textTertiary, partial.textSecondary) ??
      base.textTertiary,
    textAccent: firstColor(partial.textAccent, partial.link) ?? accent,
    textDanger: firstColor(partial.textDanger) ?? base.textDanger,

    // --- Границы ----------------------------------------------------------
    borderDefault: firstColor(partial.borderDefault) ?? base.borderDefault,
    borderSubtle: firstColor(partial.borderSubtle) ?? elevate(bgPrimary, 10),
    divider:
      firstColor(partial.divider, partial.borderDefault) ?? elevate(bgPrimary, 14),

    // --- Акцент -----------------------------------------------------------
    accent,
    link: firstColor(partial.link, partial.textAccent) ?? accent,

    // --- Действия ---------------------------------------------------------
    actionPrimaryBg,
    // Подпись кнопки обязана читаться на её фоне. Если платформа прислала
    // свой вариант и он контрастен — уважаем его, иначе подбираем сами.
    actionPrimaryText: pickContrastingText(
      firstColor(partial.actionPrimaryText),
      actionPrimaryBg
    ),
    actionDangerBg,
    actionDangerText: pickContrastingText(
      firstColor(partial.actionDangerText),
      actionDangerBg
    ),

    // --- Поверхности ------------------------------------------------------
    surfaceSection,
    surfaceHeader: firstColor(partial.surfaceHeader) ?? bgSecondary,
    surfaceTabbar:
      firstColor(partial.surfaceTabbar, partial.surfaceHeader) ?? bgSecondary,

    // --- Статусы ----------------------------------------------------------
    success: firstColor(partial.success) ?? base.success,
    warning: firstColor(partial.warning) ?? base.warning,
    destructive:
      firstColor(partial.destructive, partial.textDanger) ?? base.destructive,
  }
}

/** Минимальный контраст подписи на кнопке (WCAG AA для обычного текста) */
const MIN_BUTTON_TEXT_CONTRAST = 4.5

/**
 * Выбрать цвет подписи на цветной кнопке.
 *
 * Предложенный платформой цвет принимается только если он реально читается;
 * иначе берём чёрный или белый — что контрастнее.
 */
function pickContrastingText(
  proposed: string | undefined,
  background: string
): string {
  if (
    proposed &&
    isHex(background) &&
    contrastRatio(proposed, background) >= MIN_BUTTON_TEXT_CONTRAST
  ) {
    return proposed
  }

  return isHex(background) ? pickReadableText(background) : "#ffffff"
}

/**
 * Соответствие полей Telegram themeParams нашим токенам.
 *
 * Ключи — snake_case, как их отдаёт Telegram WebApp API.
 * Значение может быть массивом: берём первое пригодное.
 */
const TELEGRAM_FIELD_MAP: Partial<Record<keyof ThemeTokens, string[]>> = {
  bgPrimary: ["bg_color"],
  bgSecondary: ["secondary_bg_color"],
  bgElevated: ["section_bg_color", "bg_color"],

  textPrimary: ["text_color"],
  textSecondary: ["subtitle_text_color", "hint_color"],
  textTertiary: ["hint_color", "subtitle_text_color"],
  textAccent: ["accent_text_color", "link_color"],
  textDanger: ["destructive_text_color"],

  borderDefault: ["section_separator_color"],
  divider: ["section_separator_color"],

  accent: ["button_color", "accent_text_color"],
  link: ["link_color", "accent_text_color"],

  actionPrimaryBg: ["button_color"],
  actionPrimaryText: ["button_text_color"],
  actionDangerBg: ["destructive_text_color"],

  surfaceSection: ["section_bg_color"],
  surfaceHeader: ["header_bg_color", "secondary_bg_color"],
  surfaceTabbar: ["bottom_bar_bg_color", "header_bg_color"],

  destructive: ["destructive_text_color"],
}

/**
 * Привести сырую тему платформы к полному набору токенов.
 *
 * Если палитры нет (MAX, браузер) — возвращаем наш пресет для этой схемы:
 * платформа сообщила только «светло/темно», и это всё, что мы обязаны учесть.
 */
export function normalizeRuntimeTheme(input: RuntimeThemeInput): ThemeTokens {
  const scheme: ColorScheme = input.scheme === "light" ? "light" : "dark"
  const colors = input.colors

  if (!colors || Object.keys(colors).length === 0) {
    return getDefaultThemeForScheme(scheme).tokens
  }

  const partial: Partial<ThemeTokens> = { scheme }

  for (const [token, fields] of Object.entries(TELEGRAM_FIELD_MAP)) {
    const value = firstColor(...fields.map((field) => colors[field]))

    if (value) {
      partial[token as keyof ThemeTokens] = value as never
    }
  }

  return deriveTokens(partial, scheme)
}

/**
 * Схема, объявленная хостом на документе до старта приложения.
 *
 * Мессенджер MAX не отдаёт палитру — он лишь проставляет
 * `style="color-scheme: dark"` на <html>. Это единственный сигнал о теме,
 * который у нас есть, и снять его нужно ДО того, как injectThemeVariables
 * запишет туда наше собственное значение — иначе мы будем читать сами себя.
 *
 * Поэтому снимок делается один раз на этапе импорта модуля: импорт
 * гарантированно происходит раньше первого эффекта ThemeProvider.
 */
const hostDeclaredScheme: ColorScheme | null = (() => {
  if (typeof document === "undefined") {
    return null
  }

  // Только инлайновый стиль документа: значение из наших таблиц стилей
  // здесь не учитывается, нас интересует именно воля хоста
  const declared = document.documentElement.style.colorScheme

  if (declared === "dark" || declared === "light") {
    return declared
  }

  return null
})()

/**
 * Определить схему, выбранную пользователем на уровне платформы.
 *
 * Приоритет: явное указание хоста (MAX) → системная настройка браузера.
 */
export function detectSystemScheme(): ColorScheme {
  if (hostDeclaredScheme) {
    return hostDeclaredScheme
  }

  if (typeof window === "undefined") {
    return "dark"
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

/**
 * Схема, объявленная хостом, если он её объявлял.
 *
 * Отличается от detectSystemScheme тем, что не подмешивает системную
 * настройку браузера — нужен адаптерам платформ, чтобы понять,
 * управляет ли хост темой вообще.
 */
export function getHostDeclaredScheme(): ColorScheme | null {
  return hostDeclaredScheme
}
