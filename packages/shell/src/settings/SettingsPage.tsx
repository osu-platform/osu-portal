import React, { useState } from "react"
import { useAuthActions, useAuthState } from "@portal/runtime"
import styles from "./SettingsPage.module.css"
import { ThemePicker } from "./ThemePicker"
import { useSdk } from "@portal/module-sdk"

function useMaxDiagnostics() {
  // The shell reads platform identity through the SDK like everyone else —
  // there is exactly one place left that touches window.WebApp, and it is
  // runtime/src/sdk/platformUser.ts.
  const { user, environment } = useSdk()
  return {
    hasWebApp: user.platformUserId !== null,
    sdkVersion: environment.platform,
    userId: user.platformUserId,
  }
}

export const SettingsPage: React.FC = () => {
  const { user } = useAuthState()
  const { logout } = useAuthActions()
  const [showDiag, setShowDiag] = useState(false)
  const [onboardingReset, setOnboardingReset] = useState(false)

  const handleResetOnboarding = () => {
    localStorage.removeItem("portal.schedule.onboarding.shown")
    localStorage.removeItem("portal.schedule.onboarding.state")
    localStorage.removeItem("portal.schedule.onboarding.progress")
    setOnboardingReset(true)
    setTimeout(() => setOnboardingReset(false), 2000)
  }

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Пользователь"
  const handle = user?.username ? `@${user.username}` : `ID: ${user?.id ?? "—"}`

  const buildDate = new Date(__BUILD_DATE__).toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })

  const diagnostics = useMaxDiagnostics()
  const diag = showDiag ? diagnostics : null

  return (
    <div className={styles.root}>
      <h1 className={styles.pageTitle}>Настройки</h1>

      {/* User card */}
      <div className={styles.userCard}>
        <div className={styles.avatar}>{fullName.charAt(0).toUpperCase()}</div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>{fullName}</p>
          <p className={styles.userHandle}>{handle}</p>
        </div>
      </div>

      {/* Appearance */}
      <p className={styles.sectionLabel}>Интерфейс</p>
      <div className={styles.group}>
        <div className={styles.rowLast}>
          <span className={styles.rowLabel}>Язык</span>
          <select className={styles.select} defaultValue="ru">
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* Theme */}
      <p className={styles.sectionLabel}>Тема оформления</p>
      <div className={styles.group}>
        <ThemePicker />
      </div>

      {/* Schedule onboarding */}
      <p className={styles.sectionLabel}>Расписание</p>
      <div className={styles.group}>
        <button
          className={onboardingReset ? styles.btnSuccess : styles.btn}
          onClick={handleResetOnboarding}
        >
          {onboardingReset ? "Онбординг сброшен" : "Сбросить онбординг расписания"}
        </button>
      </div>

      {/* App info */}
      <p className={styles.sectionLabel}>О приложении</p>
      <div className={styles.group}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>Коммит</span>
          <span className={styles.rowValue}>{__GIT_HASH__}</span>
        </div>
        <div className={styles.rowLast}>
          <span className={styles.rowLabel}>Сборка</span>
          <span className={styles.rowValue}>{buildDate}</span>
        </div>
      </div>

      {/* MAX SDK diagnostics */}
      <p className={styles.sectionLabel}>Диагностика</p>
      <div className={styles.group}>
        <button className={styles.btnAccent} onClick={() => setShowDiag((v) => !v)}>
          {showDiag ? "Скрыть диагностику MAX SDK" : "Показать диагностику MAX SDK"}
        </button>
        {showDiag && diag && (
          <>
            <div className={styles.row}>
              <span className={styles.rowLabel}>WebApp</span>
              <span className={diag.hasWebApp ? styles.rowValueSuccess : styles.rowValueError}>
                {diag.hasWebApp ? "✓ найден" : "✗ не найден"}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>SDK путь</span>
              <span className={styles.rowValue}>{diag.sdkVersion ?? "—"}</span>
            </div>
            <div className={styles.rowLast}>
              <span className={styles.rowLabel}>User ID</span>
              <span className={diag.userId ? styles.rowValueSuccess : styles.rowValueError}>
                {diag.userId ?? "✗ не найден"}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Account */}
      <p className={styles.sectionLabel}>Аккаунт</p>
      <div className={styles.group}>
        <button className={styles.btnDanger} onClick={logout}>
          Выйти из аккаунта
        </button>
      </div>
    </div>
  )
}
