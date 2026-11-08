import { presets } from "@portal/shared-theme"
import { useThemePreference } from "./useThemePreference"
import styles from "./ThemePicker.module.css"

const THEME_DESC: Record<string, string> = {
  system: "Следует за настройками платформы",
  dark: "Тёмный интерфейс",
  light: "Светлый классический интерфейс",
  midnight: "Глубокий AMOLED с фиолетовым акцентом",
  nord: "Холодная арктическая палитра",
  latte: "Тёплый кремовый светлый",
}

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7l3.5 3.5 5.5-7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const SystemSwatch = () => (
  <div className={styles.swatch} style={{ background: "linear-gradient(135deg, #181818 0%, #f5f5f5 100%)" }}>
    <div className={styles.swatchDot} style={{ background: "linear-gradient(135deg, #64b5f6, #168acd)" }} />
  </div>
)

export const ThemePicker = () => {
  const { presetId, set } = useThemePreference()

  // null = системная
  const activeId = presetId ?? "system"

  return (
    <div className={styles.list}>
      {/* Системная — первой */}
      <button className={styles.item} onClick={() => set(null)}>
        <SystemSwatch />
        <div className={styles.itemInfo}>
          <p className={styles.itemName}>Системная</p>
          <p className={styles.itemDesc}>{THEME_DESC.system}</p>
        </div>
        {activeId === "system" ? (
          <div className={styles.check}><CheckIcon /></div>
        ) : (
          <div className={styles.checkEmpty} />
        )}
      </button>

      {presets.map((theme) => {
        const isActive = theme.id === activeId
        const bg = theme.tokens.bgPrimary
        const accent = theme.tokens.accent
        const bg2 = theme.tokens.bgSecondary

        return (
          <button key={theme.id} className={styles.item} onClick={() => set(theme.id)}>
            <div
              className={styles.swatch}
              style={{ background: `linear-gradient(135deg, ${bg2} 0%, ${bg} 100%)` }}
            >
              <div className={styles.swatchDot} style={{ background: accent }} />
            </div>
            <div className={styles.itemInfo}>
              <p className={styles.itemName}>{theme.name}</p>
              <p className={styles.itemDesc}>{THEME_DESC[theme.id] ?? ""}</p>
            </div>
            {isActive ? (
              <div className={styles.check}><CheckIcon /></div>
            ) : (
              <div className={styles.checkEmpty} />
            )}
          </button>
        )
      })}
    </div>
  )
}
