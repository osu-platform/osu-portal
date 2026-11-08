/**
 * OnboardingLayout — Layout for the onboarding flow
 *
 * Used on: /onboarding/verify-student, /onboarding/complete
 * Structure: header with step indicator, main content, no tabbar
 */

import React from "react"
import type { ReactNode } from "react"

export interface OnboardingLayoutProps {
  children?: ReactNode
  /** Current step number (1-based), optional */
  step?: number
  /** Total steps, optional */
  totalSteps?: number
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
    padding: "32px 24px 16px",
    gap: "12px",
  },
  logo: {
    fontSize: "32px",
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
  },
  progressBar: {
    width: "100%",
    height: "4px",
    background: "var(--p-color-text-tertiary, #e0e0e0)",
    borderRadius: "2px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "var(--p-color-link, #004F9F)",
    borderRadius: "2px",
    transition: "width 0.3s ease",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    padding: "16px 24px 32px",
    gap: "16px",
  },
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  step,
  totalSteps,
}) => {
  const progressPct =
    step != null && totalSteps != null && totalSteps > 0
      ? Math.round((step / totalSteps) * 100)
      : null

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.logo}>🎓</div>
        <h1 style={styles.title}>Добро пожаловать в Портал ОГУ</h1>
        {progressPct != null && (
          <div style={{ ...styles.progressBar, width: "100%" }}>
            <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
          </div>
        )}
        {step != null && totalSteps != null && (
          <span style={{ fontSize: "12px", opacity: 0.5 }}>
            Шаг {step} из {totalSteps}
          </span>
        )}
      </header>
      <main style={styles.main}>{children}</main>
    </div>
  )
}
