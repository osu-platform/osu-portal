/**
 * Тесты пресетов темы.
 *
 * Здесь проверяется то, что ломается тише всего: неполный набор токенов,
 * нечитаемый текст и расхождение CSS-фолбэка с реальной тёмной темой.
 */

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import { describe, expect, it } from "vitest"

import { presets, darkTheme } from "../presets"
import { TOKEN_KEYS } from "../types"
import { TOKEN_MAP } from "../utils/css"
import { findContrastViolations } from "../utils/contrast"
import { isHex } from "../utils/color"

const here = dirname(fileURLToPath(import.meta.url))

/** Глобальный CSS с фолбэком токенов */
const TOKENS_CSS = resolve(
  here,
  "../../../ui/src/styles/tokens.css"
)

describe("пресеты темы", () => {
  it("идентификаторы уникальны", () => {
    const ids = presets.map((preset) => preset.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(presets.map((preset) => [preset.id, preset] as const))(
    "«%s» содержит все токены и только валидные цвета",
    (_id, preset) => {
      for (const key of TOKEN_KEYS) {
        expect(preset.tokens[key], `отсутствует токен ${key}`).toBeTruthy()
      }

      for (const key of TOKEN_KEYS) {
        if (key === "scheme") {
          continue
        }

        expect(
          isHex(preset.tokens[key]),
          `${key} = "${preset.tokens[key]}" — не hex-цвет`
        ).toBe(true)
      }
    }
  )

  it.each(presets.map((preset) => [preset.id, preset] as const))(
    "«%s»: приподнятая поверхность отличается от базового фона",
    (_id, preset) => {
      // Секции стоят на bgPrimary, карточки — на bgElevated. Если значения
      // совпадают, карточка сливается с фоном секции (см. internal change) —
      // разметка при этом остаётся «корректной», баг незаметен по коду.
      expect(
        preset.tokens.bgElevated,
        `bgElevated совпадает с bgPrimary (${preset.tokens.bgPrimary}) — карточки сольются с фоном секций`
      ).not.toBe(preset.tokens.bgPrimary)
    }
  )

  it.each(presets.map((preset) => [preset.id, preset] as const))(
    "«%s» проходит WCAG 2.1 AA",
    (_id, preset) => {
      const violations = findContrastViolations(preset.tokens)

      // Разворачиваем нарушения в читаемый текст: иначе при падении теста
      // видно только «ожидалось 0», без подсказки что именно чинить
      const report = violations
        .map(
          (violation) =>
            `${violation.foreground} (${violation.foregroundColor}) на ` +
            `${violation.background} (${violation.backgroundColor}): ` +
            `${violation.ratio} < ${violation.required} — ${violation.reason}`
        )
        .join("\n")

      expect(report).toBe("")
    }
  )
})

describe("CSS-фолбэк токенов", () => {
  const css = readFileSync(TOKENS_CSS, "utf8")

  /** Значение переменной из блока :root */
  const readVariable = (name: string): string | null => {
    const match = css.match(
      new RegExp(`${name.replace(/-/g, "\\-")}:\\s*([^;]+);`)
    )

    return match ? match[1].trim() : null
  }

  it("объявляет каждый токен темы", () => {
    for (const key of TOKEN_KEYS) {
      expect(
        readVariable(TOKEN_MAP[key]),
        `в tokens.css нет переменной ${TOKEN_MAP[key]}`
      ).not.toBeNull()
    }
  })

  it("совпадает с пресетом dark", () => {
    // Фолбэк показывается до старта JS. Если он разъедется с темой
    // по умолчанию, приложение будет заметно перекрашиваться при загрузке.
    for (const key of TOKEN_KEYS) {
      expect(
        readVariable(TOKEN_MAP[key]),
        `${TOKEN_MAP[key]} разошёлся с пресетом dark`
      ).toBe(darkTheme.tokens[key])
    }
  })
})
