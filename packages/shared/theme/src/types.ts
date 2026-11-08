/**
 * Theme System Types
 *
 * Определяет модель семантических токенов и конфигурацию темы.
 *
 * Правила модели:
 * - Токен описывает РОЛЬ цвета, а не его вид ("текст второго уровня", а не "серый").
 * - Токенов ровно столько, сколько ролей. Дубли ролей (textMuted/textHint) запрещены —
 *   именно они приводят к тому, что одинаковые по смыслу элементы красятся по-разному.
 * - Значения, которые можно вычислить из других (полупрозрачные заливки, состояния
 *   hover/active), НЕ входят в пресет — они выводятся в CSS через color-mix.
 *   См. packages/shared/ui/src/styles/tokens.css
 */

/**
 * Цветовая схема темы
 */
export type ColorScheme = "light" | "dark"

/**
 * Семантические цветовые токены.
 *
 * Платформо-независимы. Каждый маппится в CSS-переменную `--p-color-*`
 * (полная таблица соответствия — в utils/css.ts).
 */
export interface ThemeTokens {
  /** Схема — определяет ветку вычисляемых токенов и native color-scheme */
  scheme: ColorScheme

  // --- Фоны ---------------------------------------------------------------
  /** Фон контента: основная «бумага» под текстом */
  bgPrimary: string
  /** Фон подложки: то, на чём лежат карточки и секции */
  bgSecondary: string
  /** Приподнятая поверхность: модалки, поповеры, карточки поверх подложки */
  bgElevated: string

  // --- Текст --------------------------------------------------------------
  /** Основной текст */
  textPrimary: string
  /** Второстепенный текст: подзаголовки, описания */
  textSecondary: string
  /** Третьестепенный текст: плейсхолдеры, подсказки, дизейбл */
  textTertiary: string
  /** Акцентный текст (не ссылка): выделенные значения */
  textAccent: string
  /** Текст ошибки / деструктивного действия */
  textDanger: string

  // --- Границы ------------------------------------------------------------
  /** Заметная граница: обводка полей ввода, контуры */
  borderDefault: string
  /** Тонкая граница: еле заметное отделение */
  borderSubtle: string
  /** Разделитель между элементами списка */
  divider: string

  // --- Акцент -------------------------------------------------------------
  /** Основной акцент бренда */
  accent: string
  /** Цвет ссылок и интерактивных элементов */
  link: string

  // --- Действия -----------------------------------------------------------
  /** Фон основной кнопки */
  actionPrimaryBg: string
  /** Текст на основной кнопке (должен контрастировать с actionPrimaryBg) */
  actionPrimaryText: string
  /** Фон деструктивной кнопки */
  actionDangerBg: string
  /** Текст на деструктивной кнопке */
  actionDangerText: string

  // --- Поверхности --------------------------------------------------------
  /** Фон секции/карточки списка */
  surfaceSection: string
  /** Фон шапки экрана */
  surfaceHeader: string
  /** Фон нижней навигации */
  surfaceTabbar: string

  // --- Статусы ------------------------------------------------------------
  /** Успех */
  success: string
  /** Предупреждение */
  warning: string
  /** Ошибка/опасность как статус (бейджи, иконки) */
  destructive: string
}

/**
 * Полное определение темы
 */
export interface PortalTheme {
  id: string
  name: string
  tokens: ThemeTokens
}

/**
 * Режим темы
 */
export type ThemeMode =
  | { type: "runtime" } // Тема платформы (Telegram / MAX / браузер)
  | { type: "preset"; presetId: string } // Наш заготовленный пресет
  | { type: "custom"; tokens: Partial<ThemeTokens> } // Произвольные переопределения

/**
 * Пользовательская конфигурация темы
 */
export interface UserThemeConfig {
  mode: ThemeMode
  overrides?: Partial<ThemeTokens>
}

/**
 * Сырые данные темы от платформы.
 *
 * `colors` может быть пустым — это нормальный случай (MAX, браузер):
 * платформа сообщает только схему, а палитру берём из нашего пресета.
 */
export interface RuntimeThemeInput {
  scheme: ColorScheme
  colors?: Record<string, string>
}

/**
 * Полный список ключей токенов.
 *
 * Единственный источник правды о составе модели: по нему строится TOKEN_MAP,
 * проверка полноты пресетов и валидатор контраста. Добавил токен в ThemeTokens —
 * TypeScript заставит добавить его и сюда.
 */
export const TOKEN_KEYS = [
  "scheme",
  "bgPrimary",
  "bgSecondary",
  "bgElevated",
  "textPrimary",
  "textSecondary",
  "textTertiary",
  "textAccent",
  "textDanger",
  "borderDefault",
  "borderSubtle",
  "divider",
  "accent",
  "link",
  "actionPrimaryBg",
  "actionPrimaryText",
  "actionDangerBg",
  "actionDangerText",
  "surfaceSection",
  "surfaceHeader",
  "surfaceTabbar",
  "success",
  "warning",
  "destructive",
] as const satisfies readonly (keyof ThemeTokens)[]

/** Ключи цветовых токенов (всё, кроме `scheme`) */
export const COLOR_TOKEN_KEYS = TOKEN_KEYS.filter(
  (key): key is Exclude<(typeof TOKEN_KEYS)[number], "scheme"> =>
    key !== "scheme"
)

/**
 * Проверка: значение является валидным UserThemeConfig
 */
export function isValidUserThemeConfig(
  value: unknown
): value is UserThemeConfig {
  if (!value || typeof value !== "object") {
    return false
  }

  const config = value as UserThemeConfig

  if (!config.mode || typeof config.mode !== "object") {
    return false
  }

  const { mode } = config

  if (mode.type === "preset") {
    return typeof mode.presetId === "string"
  }

  if (mode.type === "custom") {
    return typeof mode.tokens === "object"
  }

  if (mode.type === "runtime") {
    return true
  }

  return false
}

/**
 * Проверка: объект содержит все токены темы
 */
export function isValidThemeTokens(tokens: unknown): tokens is ThemeTokens {
  if (!tokens || typeof tokens !== "object") {
    return false
  }

  return TOKEN_KEYS.every((key) => key in tokens)
}
