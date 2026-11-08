/**
 * Theme Resolution
 *
 * Сводит все источники темы в один финальный набор токенов.
 *
 * Приоритет (от высшего к низшему):
 * 1. userTheme.overrides — точечные переопределения пользователя
 * 2. userTheme.mode      — выбранный пресет / произвольная тема / «как в платформе»
 * 3. runtimeTheme        — тема платформы (Telegram / MAX / браузер)
 * 4. Пресет по умолчанию
 */

import type { ThemeTokens, UserThemeConfig, RuntimeThemeInput } from "../types"
import { getPreset, getDefaultTheme, getDefaultThemeForScheme } from "../presets"
import { normalizeRuntimeTheme, deriveTokens } from "./normalize"

/**
 * Тема платформы, либо пресет по умолчанию, если платформы нет.
 */
function fromRuntime(runtimeInput: RuntimeThemeInput | null): ThemeTokens {
  return runtimeInput
    ? normalizeRuntimeTheme(runtimeInput)
    : getDefaultTheme().tokens
}

/**
 * Вычислить итоговые токены темы
 */
export function resolveTheme(
  userConfig: UserThemeConfig | null,
  runtimeInput: RuntimeThemeInput | null
): ThemeTokens {
  let tokens: ThemeTokens

  if (!userConfig) {
    // Пользователь ничего не выбирал — идём за платформой
    tokens = fromRuntime(runtimeInput)
  } else {
    switch (userConfig.mode.type) {
      case "preset": {
        const preset = getPreset(userConfig.mode.presetId)

        // Неизвестный пресет (например, удалённый из сборки) не должен
        // ронять тему: откатываемся на схему платформы, а не на дефолт вслепую
        tokens = preset
          ? preset.tokens
          : getDefaultThemeForScheme(
              runtimeInput?.scheme ?? getDefaultTheme().tokens.scheme
            ).tokens
        break
      }

      case "custom": {
        const custom = userConfig.mode.tokens
        const scheme = custom.scheme ?? runtimeInput?.scheme ?? "dark"
        tokens = deriveTokens(custom, scheme)
        break
      }

      case "runtime":
      default: {
        tokens = fromRuntime(runtimeInput)
        break
      }
    }
  }

  // Точечные переопределения применяются поверх любого источника.
  // deriveTokens после них нужен, чтобы согласовать зависимые токены:
  // сменил пользователь фон — подпись на кнопке пересчитается под него.
  if (userConfig?.overrides && Object.keys(userConfig.overrides).length > 0) {
    const merged = { ...tokens, ...userConfig.overrides }
    tokens = deriveTokens(merged, merged.scheme)
  }

  return tokens
}

/**
 * Производная информация о теме для потребителей контекста
 */
export function getThemeInfo(tokens: ThemeTokens): {
  isDark: boolean
  scheme: "light" | "dark"
} {
  return {
    isDark: tokens.scheme === "dark",
    scheme: tokens.scheme,
  }
}
