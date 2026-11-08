/**
 * Theme Provider
 *
 * Контролируемый компонент: получает источники темы пропсами, разрешает
 * приоритеты и записывает результат в CSS-переменные. Ничего не хранит —
 * персистентность выбора пользователя лежит на внешнем состоянии.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  ReactNode,
} from "react"
import type {
  ThemeTokens,
  UserThemeConfig,
  RuntimeThemeInput,
  ColorScheme,
} from "./types"
import { injectThemeVariables } from "./utils/css"
import { resolveTheme, getThemeInfo } from "./utils/resolver"

/**
 * Значение контекста (только чтение)
 */
interface ThemeContextValue {
  tokens: ThemeTokens
  isDark: boolean
  scheme: ColorScheme
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

interface ThemeProviderProps {
  children: ReactNode
  /** Выбор пользователя (из внешнего состояния) */
  userTheme?: UserThemeConfig | null
  /** Тема платформы: Telegram, MAX, браузер */
  runtimeTheme?: RuntimeThemeInput | null
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  userTheme = null,
  runtimeTheme = null,
}) => {
  // Пересчёт только при смене источников
  const tokens = useMemo(
    () => resolveTheme(userTheme, runtimeTheme),
    [userTheme, runtimeTheme]
  )

  // Единственное место записи в DOM. Реактивность обеспечивает сам useMemo:
  // сменилась тема платформы → новый объект токенов → эффект перезапишет
  // переменные. Отдельная «страховочная» инъекция не нужна и приводила
  // к двойной записи на каждое изменение runtimeTheme.
  useEffect(() => {
    injectThemeVariables(tokens)
  }, [tokens])

  const value = useMemo<ThemeContextValue>(() => {
    const { isDark, scheme } = getThemeInfo(tokens)
    return { tokens, isDark, scheme }
  }, [tokens])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * Доступ к разрешённой теме
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return context
}
