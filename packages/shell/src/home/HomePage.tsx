/**
 * HomePage — Main dashboard page
 *
 * Shown when: authState === 'authenticated', route /dashboard
 * Status: placeholder until modules are implemented (Phase 7)
 */

import React from "react"
import { Link } from "react-router-dom"
import { useAuthState, useModuleWidgets } from "@portal/runtime"

const styles = {
  root: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  },
  greeting: {
    fontSize: "20px",
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    opacity: 0.55,
    margin: 0,
  },
  section: {
    background: "var(--p-color-bg-secondary, #f5f5f5)",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  sectionTitle: {
    fontSize: "13px",
    fontWeight: 600,
    opacity: 0.55,
    margin: 0,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  placeholder: {
    fontSize: "14px",
    opacity: 0.45,
    margin: 0,
  },
  moduleGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  moduleCard: {
    background: "var(--p-color-bg-secondary, #fff)",
    borderRadius: "10px",
    padding: "14px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
    border: "1px solid var(--p-color-text-tertiary, #e0e0e0)",
    cursor: "pointer",
    textDecoration: "none",
    color: "inherit",
  },
  moduleIcon: {
    fontSize: "24px",
  },
  moduleName: {
    fontSize: "13px",
    fontWeight: 600,
    margin: 0,
  },
  moduleDesc: {
    fontSize: "11px",
    opacity: 0.5,
    margin: 0,
  },
}

const MODULES = [
  {
    path: "/schedule",
    icon: "📅",
    name: "Расписание",
    desc: "Занятия и события",
  },
  { path: "/profile", icon: "👤", name: "Профиль", desc: "Личные данные" },
  {
    path: "/settings",
    icon: "⚙️",
    name: "Настройки",
    desc: "Параметры приложения",
  },
]

export const HomePage: React.FC = () => {
  const { user } = useAuthState()
  const firstName = user?.firstName ?? "студент"
  const dashboardWidgets = useModuleWidgets("dashboardWidget")

  return (
    <div style={styles.root}>
      <div>
        <h1 style={styles.greeting}>Добро пожаловать, {firstName}!</h1>
        <p style={styles.subtitle}>Портал ОГУ — всё в одном месте</p>
      </div>

      <div style={styles.section}>
        <p style={styles.sectionTitle}>Сегодня</p>
        {dashboardWidgets.length > 0 ? (
          dashboardWidgets.map(({ moduleName, render }) => (
            <React.Fragment key={moduleName}>{render()}</React.Fragment>
          ))
        ) : (
          <p style={styles.placeholder}>Нет доступных модулей</p>
        )}
      </div>

      <div style={styles.section}>
        <p style={styles.sectionTitle}>Разделы</p>
        <div style={styles.moduleGrid}>
          {MODULES.map((m) => (
            <Link key={m.path} to={m.path} style={styles.moduleCard}>
              <span style={styles.moduleIcon}>{m.icon}</span>
              <p style={styles.moduleName}>{m.name}</p>
              <p style={styles.moduleDesc}>{m.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
