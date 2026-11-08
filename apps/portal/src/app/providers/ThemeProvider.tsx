import React, { ReactNode } from "react"
import { ThemeProvider as BaseThemeProvider } from "@portal/shared-theme"
import { useRuntimeTheme } from "@portal/shared-platform"
import { AntdThemeProvider } from "./AntdThemeProvider"
import {
  useThemePreferenceState,
  ThemePreferenceContext,
} from "@portal/shell"

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const runtimeTheme = useRuntimeTheme()
  const { presetId, set, userTheme } = useThemePreferenceState()

  return (
    <ThemePreferenceContext.Provider value={{ presetId, set }}>
      <BaseThemeProvider runtimeTheme={runtimeTheme} userTheme={userTheme}>
        <AntdThemeProvider>{children}</AntdThemeProvider>
      </BaseThemeProvider>
    </ThemePreferenceContext.Provider>
  )
}
