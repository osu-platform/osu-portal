import { useState, useCallback, createContext, useContext } from "react"
import type { UserThemeConfig } from "@portal/shared-theme"

const STORAGE_KEY = "portal.theme.preset"

export function loadPresetId(): string | null {
  try { return localStorage.getItem(STORAGE_KEY) } catch { return null }
}

export function savePresetId(id: string | null) {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

// null = ничего не выбрано → ThemeProvider использует runtimeTheme платформы
export function buildUserTheme(presetId: string | null): UserThemeConfig | null {
  if (!presetId) return null
  return { mode: { type: "preset", presetId } }
}

export function useThemePreferenceState() {
  const [presetId, setPresetId] = useState<string | null>(loadPresetId)

  const set = useCallback((id: string | null) => {
    savePresetId(id)
    setPresetId(id)
  }, [])

  return { presetId, set, userTheme: buildUserTheme(presetId) }
}

export type ThemePreferenceContextValue = {
  presetId: string | null
  set: (id: string | null) => void
}

export const ThemePreferenceContext = createContext<ThemePreferenceContextValue>({
  presetId: null,
  set: () => {},
})

export function useThemePreference() {
  return useContext(ThemePreferenceContext)
}
