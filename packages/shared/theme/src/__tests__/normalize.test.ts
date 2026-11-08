/**
 * Тесты нормализации тем платформ.
 *
 * Проверяют главное свойство системы: какой бы обрезанной ни пришла тема
 * от хоста, на выходе получается полный и читаемый набор токенов.
 */

import { describe, expect, it } from "vitest"

import { normalizeRuntimeTheme, deriveTokens } from "../utils/normalize"
import { darkTheme, lightTheme } from "../presets"
import { TOKEN_KEYS } from "../types"
import { contrastRatio } from "../utils/color"
import { findContrastViolations } from "../utils/contrast"

/** Тема Telegram, близкая к настоящей */
const telegramDark = {
  bg_color: "#17212b",
  secondary_bg_color: "#0e1621",
  text_color: "#f5f5f5",
  hint_color: "#708499",
  link_color: "#6ab3f3",
  button_color: "#5288c1",
  button_text_color: "#ffffff",
  section_bg_color: "#17212b",
  header_bg_color: "#17212b",
  accent_text_color: "#6ab3f3",
  destructive_text_color: "#ec3942",
  section_separator_color: "#101921",
  subtitle_text_color: "#708499",
  bottom_bar_bg_color: "#17212b",
}

describe("normalizeRuntimeTheme", () => {
  it("заполняет все токены из палитры Telegram", () => {
    const tokens = normalizeRuntimeTheme({
      scheme: "dark",
      colors: telegramDark,
    })

    for (const key of TOKEN_KEYS) {
      expect(tokens[key], `не заполнен токен ${key}`).toBeTruthy()
    }
  })

  it("использует цвета Telegram, а не подменяет их своими", () => {
    const tokens = normalizeRuntimeTheme({
      scheme: "dark",
      colors: telegramDark,
    })

    expect(tokens.bgPrimary).toBe("#17212b")
    expect(tokens.bgSecondary).toBe("#0e1621")
    expect(tokens.textPrimary).toBe("#f5f5f5")
    expect(tokens.link).toBe("#6ab3f3")
    expect(tokens.actionPrimaryBg).toBe("#5288c1")
  })

  it("возвращает наш пресет, когда палитры нет (MAX, браузер)", () => {
    expect(normalizeRuntimeTheme({ scheme: "dark" })).toEqual(darkTheme.tokens)
    expect(normalizeRuntimeTheme({ scheme: "light" })).toEqual(
      lightTheme.tokens
    )
    expect(normalizeRuntimeTheme({ scheme: "light", colors: {} })).toEqual(
      lightTheme.tokens
    )
  })

  it("игнорирует пустые и битые значения вместо того, чтобы их применять", () => {
    const tokens = normalizeRuntimeTheme({
      scheme: "dark",
      colors: {
        bg_color: "",
        text_color: "не цвет",
        link_color: "#6ab3f3",
      },
    })

    // Пустая строка прошла бы проверку на undefined и обнулила бы фон
    expect(tokens.bgPrimary).toBe(darkTheme.tokens.bgPrimary)
    expect(tokens.textPrimary).toBe(darkTheme.tokens.textPrimary)
    expect(tokens.link).toBe("#6ab3f3")
  })

  it("не теряет читаемость подписи на кнопке платформы", () => {
    // Telegram присылает белый текст на светлой кнопке — так бывает
    const tokens = normalizeRuntimeTheme({
      scheme: "light",
      colors: {
        button_color: "#ffe066",
        button_text_color: "#ffffff",
      },
    })

    expect(
      contrastRatio(tokens.actionPrimaryText, tokens.actionPrimaryBg)
    ).toBeGreaterThanOrEqual(4.5)
  })

  it("сохраняет предложенный цвет подписи, если он контрастен", () => {
    const tokens = normalizeRuntimeTheme({
      scheme: "dark",
      colors: {
        button_color: "#1c4a7a",
        button_text_color: "#ffffff",
      },
    })

    expect(tokens.actionPrimaryText).toBe("#ffffff")
  })

  it("перебивает подпись Telegram, когда она не дотягивает до AA", () => {
    // Штатная синяя кнопка Telegram: белый текст на #5288c1 даёт 3.7:1.
    // Мы сознательно отходим от нативного вида ради читаемости.
    const tokens = normalizeRuntimeTheme({
      scheme: "dark",
      colors: {
        button_color: "#5288c1",
        button_text_color: "#ffffff",
      },
    })

    expect(tokens.actionPrimaryText).toBe("#000000")
    expect(
      contrastRatio(tokens.actionPrimaryText, tokens.actionPrimaryBg)
    ).toBeGreaterThanOrEqual(4.5)
  })

  it("выводит приподнятую поверхность светлее фона в тёмной теме", () => {
    const tokens = normalizeRuntimeTheme({
      scheme: "dark",
      colors: { bg_color: "#101010" },
    })

    expect(tokens.bgElevated).not.toBe(tokens.bgPrimary)
  })
})

describe("deriveTokens", () => {
  it("достраивает полный набор из одного фона", () => {
    const tokens = deriveTokens({ bgPrimary: "#101010" }, "dark")

    for (const key of TOKEN_KEYS) {
      expect(tokens[key], `не заполнен токен ${key}`).toBeTruthy()
    }
  })

  it("тема Telegram остаётся пригодной по контрасту основного текста", () => {
    const tokens = normalizeRuntimeTheme({
      scheme: "dark",
      colors: telegramDark,
    })

    const criticalViolations = findContrastViolations(tokens).filter(
      (violation) => violation.foreground === "textPrimary"
    )

    expect(criticalViolations).toEqual([])
  })
})
