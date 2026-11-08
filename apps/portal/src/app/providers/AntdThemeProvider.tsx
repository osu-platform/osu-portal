import { ConfigProvider, theme as antdTheme } from "antd"
import ruRU from "antd/es/locale/ru_RU"
import { ReactNode, useMemo } from "react"
import { useTheme } from "@portal/shared-theme"
import dayjs from "dayjs"
import "dayjs/locale/ru"

dayjs.locale("ru")

type Props = {
  children: ReactNode
}

/**
 * Мост между нашей темой и Ant Design.
 *
 * Важно: сюда передаются РАЗРЕШЁННЫЕ значения цветов, а не строки
 * `var(--p-color-*)`. Antd не подставляет их в CSS напрямую — он прогоняет
 * цвета через свой алгоритм, вычисляя оттенки для наведения, нажатия и
 * границ. Строку `var(...)` он разобрать не может, поэтому раньше все
 * производные состояния (hover кнопок, рамки) молча ломались.
 */
export const AntdThemeProvider = ({ children }: Props) => {
  const { tokens, isDark } = useTheme()

  const config = useMemo(
    () => ({
      algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,

      token: {
        colorPrimary: tokens.actionPrimaryBg,
        colorBgBase: tokens.bgPrimary,
        colorTextBase: tokens.textPrimary,
        colorBgContainer: tokens.bgPrimary,
        colorBgElevated: tokens.bgElevated,
        colorBorder: tokens.borderDefault,
        colorSplit: tokens.divider,
        colorLink: tokens.link,
        colorError: tokens.destructive,
        colorSuccess: tokens.success,
        colorWarning: tokens.warning,
        colorTextSecondary: tokens.textSecondary,
        colorTextTertiary: tokens.textTertiary,
        colorTextPlaceholder: tokens.textTertiary,
        fontFamily: "inherit",
      },

      components: {
        DatePicker: {
          colorBgContainer: tokens.bgPrimary,
          colorBgElevated: tokens.bgElevated,
          colorText: tokens.textPrimary,
          colorTextHeading: tokens.textPrimary,
          colorIcon: tokens.textTertiary,
          colorIconHover: tokens.link,
        },
        Button: {
          colorPrimary: tokens.actionPrimaryBg,
          colorTextLightSolid: tokens.actionPrimaryText,
        },
      },
    }),
    [tokens, isDark]
  )

  return (
    <ConfigProvider locale={ruRU} theme={config}>
      {children}
    </ConfigProvider>
  )
}
