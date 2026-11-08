/**
 * Default Theme Adapter
 *
 * Подходит любому хосту, который не отдаёт палитру, а сообщает только схему:
 * обычный браузер (prefers-color-scheme) и мессенджер MAX, который выставляет
 * `style="color-scheme: dark"` на документе.
 *
 * Палитру такие хосты не дают вовсе — её берёт на себя наш пресет
 * соответствующей схемы (см. normalizeRuntimeTheme).
 */

import { detectSystemScheme } from "@portal/shared-theme"
import type { ThemeAdapter } from "../base"

/**
 * Создать адаптер темы «только схема»
 */
export const createBrowserThemeAdapter = (): ThemeAdapter => {
  const mediaQuery =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null

  return {
    // detectSystemScheme отдаёт приоритет схеме, объявленной хостом:
    // для MAX это единственный источник, для браузера — системная настройка
    getCurrent: () => detectSystemScheme(),

    // Ни браузер, ни MAX не передают цвета
    getColors: () => null,

    subscribe: (callback: () => void) => {
      if (!mediaQuery) {
        return () => {}
      }

      // Хост объявляет схему один раз при загрузке, поэтому следим только
      // за системной настройкой. Слушать изменения color-scheme на документе
      // нельзя: туда пишет наш же ThemeProvider, и мы поймали бы сами себя.
      const handler = () => callback()
      mediaQuery.addEventListener("change", handler)

      return () => mediaQuery.removeEventListener("change", handler)
    },
  }
}
