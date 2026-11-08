/**
 * MainLayout — Layout for authenticated users
 *
 * Used on: /dashboard, /schedule, /profile, /settings
 * Structure: scrollable main content + fixed bottom tabbar
 * Note: active tab detection via window.location (Phase 5: replace with useActiveRoute)
 */

import React from "react"
import type { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"

export interface MainLayoutProps {
  children?: ReactNode
}

const TABS = [
  { path: "/dashboard", label: "Главная", icon: "🏠" },
  { path: "/schedule", label: "Расписание", icon: "📅" },
  { path: "/profile", label: "Профиль", icon: "👤" },
  { path: "/settings", label: "Настройки", icon: "⚙️" },
]

const styles = {
  root: {
    display: "flex",
    flexDirection: "column" as const,
    height: "100dvh",
    background: "var(--p-color-bg-secondary, #fff)",
    color: "var(--p-color-accent)",
    fontFamily: "Roboto, sans-serif",
  },
  main: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "16px",
  },
  tabbar: {
    display: "flex",
    borderTop: "1px solid var(--p-color-text-tertiary, #e0e0e0)",
    background: "var(--p-color-bg-secondary, #fff)",
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 4px 12px",
    gap: "3px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "10px",
    textDecoration: "none",
  },
  tabIcon: {
    fontSize: "20px",
    lineHeight: 1 as const,
  },
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { pathname: currentPath } = useLocation()

  return (
    <div style={styles.root}>
      <main style={styles.main}>{children}</main>
      <nav style={styles.tabbar}>
        {TABS.map((tab) => {
          const isActive =
            currentPath === tab.path ||
            (tab.path !== "/dashboard" &&
              currentPath.startsWith(tab.path + "/"))
          return (
            <Link
              to={tab.path}
              key={tab.path}
              style={{
                ...styles.tab,
                color: isActive
                  ? "var(--p-color-link, #004F9F)"
                  : "var(--p-color-text-tertiary, #999)",
              }}
              aria-current={isActive ? "page" : undefined}
            >
              <span style={styles.tabIcon}>{tab.icon}</span>
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
