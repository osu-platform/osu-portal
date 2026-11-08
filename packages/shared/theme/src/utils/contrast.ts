/**
 * Contrast rules
 *
 * Декларативный список пар «передний план / фон», которые обязаны быть
 * различимы, и проверка пресета по нему.
 *
 * Пороги WCAG 2.1 AA:
 * - 4.5:1 — обычный текст (1.4.3)
 * - 3:1   — крупный текст (≥24px или ≥19px bold)
 * - 3:1   — границы интерактивных элементов и смысловая графика (1.4.11)
 *
 * Используется тестом пресетов и скриптом scripts/check-contrast.mjs.
 */

import type { ThemeTokens } from "../types"
import { contrastRatio } from "./color"

/** Что проверяем: обычный текст, крупный текст или не-текстовый элемент */
export type ContrastKind = "text" | "large-text" | "non-text"

export const THRESHOLDS: Record<ContrastKind, number> = {
  text: 4.5,
  "large-text": 3,
  "non-text": 3,
}

export interface ContrastRule {
  /** Токен переднего плана */
  foreground: keyof ThemeTokens
  /** Токены фонов, на которых этот цвет реально встречается */
  backgrounds: (keyof ThemeTokens)[]
  kind: ContrastKind
  /** Зачем это правило — попадает в отчёт валидатора */
  reason: string
}

/**
 * Фоны, на которых лежит основной контент.
 * Любой текстовый токен обязан читаться на каждом из них.
 */
const CONTENT_BACKGROUNDS: (keyof ThemeTokens)[] = [
  "bgPrimary",
  "bgSecondary",
  "bgElevated",
  "surfaceSection",
]

export const CONTRAST_RULES: ContrastRule[] = [
  {
    foreground: "textPrimary",
    backgrounds: CONTENT_BACKGROUNDS,
    kind: "text",
    reason: "Основной текст на всех контентных поверхностях",
  },
  {
    foreground: "textSecondary",
    backgrounds: CONTENT_BACKGROUNDS,
    kind: "text",
    reason: "Подзаголовки и описания",
  },
  {
    foreground: "textTertiary",
    backgrounds: CONTENT_BACKGROUNDS,
    kind: "text",
    reason: "Плейсхолдеры полей и подсказки — самый частый провал контраста",
  },
  {
    foreground: "textAccent",
    backgrounds: CONTENT_BACKGROUNDS,
    kind: "text",
    reason: "Акцентный текст",
  },
  {
    foreground: "textDanger",
    backgrounds: CONTENT_BACKGROUNDS,
    kind: "text",
    reason: "Тексты ошибок валидации",
  },
  {
    foreground: "link",
    backgrounds: CONTENT_BACKGROUNDS,
    kind: "text",
    reason: "Ссылки и интерактивный текст",
  },
  {
    foreground: "textPrimary",
    backgrounds: ["surfaceHeader", "surfaceTabbar"],
    kind: "text",
    reason: "Заголовок экрана и подписи таббара",
  },
  {
    foreground: "link",
    backgrounds: ["surfaceTabbar"],
    kind: "text",
    reason: "Активный пункт таббара",
  },
  {
    foreground: "actionPrimaryText",
    backgrounds: ["actionPrimaryBg"],
    kind: "text",
    reason: "Подпись основной кнопки",
  },
  {
    foreground: "actionDangerText",
    backgrounds: ["actionDangerBg"],
    kind: "text",
    reason: "Подпись деструктивной кнопки",
  },
  {
    foreground: "borderDefault",
    backgrounds: ["bgPrimary", "bgSecondary", "surfaceSection"],
    kind: "non-text",
    reason: "Обводка полей ввода — единственный признак границы поля",
  },
  {
    foreground: "accent",
    backgrounds: ["bgPrimary", "bgSecondary"],
    kind: "non-text",
    reason: "Акцентная графика: индикаторы, иконки, чекбоксы",
  },
  {
    foreground: "success",
    backgrounds: ["bgPrimary", "bgSecondary", "surfaceSection"],
    kind: "non-text",
    reason: "Статус «успех»",
  },
  {
    foreground: "warning",
    backgrounds: ["bgPrimary", "bgSecondary", "surfaceSection"],
    kind: "non-text",
    reason: "Статус «предупреждение»",
  },
  {
    foreground: "destructive",
    backgrounds: ["bgPrimary", "bgSecondary", "surfaceSection"],
    kind: "non-text",
    reason: "Статус «ошибка»",
  },
]

export interface ContrastViolation {
  foreground: keyof ThemeTokens
  background: keyof ThemeTokens
  foregroundColor: string
  backgroundColor: string
  ratio: number
  required: number
  kind: ContrastKind
  reason: string
}

/**
 * Проверить набор токенов по всем правилам.
 * Возвращает список нарушений (пустой — всё в порядке).
 */
export function findContrastViolations(
  tokens: ThemeTokens
): ContrastViolation[] {
  const violations: ContrastViolation[] = []

  for (const rule of CONTRAST_RULES) {
    const foregroundColor = tokens[rule.foreground]
    const required = THRESHOLDS[rule.kind]

    for (const background of rule.backgrounds) {
      const backgroundColor = tokens[background]
      const ratio = contrastRatio(foregroundColor, backgroundColor)

      if (ratio < required) {
        violations.push({
          foreground: rule.foreground,
          background,
          foregroundColor,
          backgroundColor,
          ratio: Math.round(ratio * 100) / 100,
          required,
          kind: rule.kind,
          reason: rule.reason,
        })
      }
    }
  }

  return violations
}
