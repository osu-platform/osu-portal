/**
 * AuthLayout — Layout for unauthenticated users
 *
 * Used on: /login, /register, onboarding entry
 * Structure: centered column, brand header, main content, footer hint
 */

import React from "react"
import type { ReactNode } from "react"

export interface AuthLayoutProps {
  children?: ReactNode
}

const styles = {
  root: {
    display: "flex",
    flexDirection: "column" as const,
    minHeight: "100dvh",
    background: "var(--p-color-bg-secondary, #fff)",
    color: "var(--p-color-text-primary, #000)",
    fontFamily: "Roboto, sans-serif",
  },
  header: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    padding: "48px 24px 24px",
    gap: "8px",
  },
  logo: {
    fontSize: "40px",
  },
  title: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "-0.3px",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    opacity: 0.55,
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    padding: "24px",
    gap: "16px",
  },
  footer: {
    padding: "16px 24px",
    textAlign: "center" as const,
    fontSize: "12px",
    opacity: 0.4,
  },
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.logo}>🎓</div>
        <h1 style={styles.title}>Портал ОГУ</h1>
        <p style={styles.subtitle}>Оренбургский государственный университет имени В.А. Бондаренко</p>
      </header>
      <main style={styles.main}>{children}</main>
      <footer style={styles.footer}>
        Официальное приложение ОГУ им. В.А. Бондаренко
      </footer>
    </div>
  )
}
