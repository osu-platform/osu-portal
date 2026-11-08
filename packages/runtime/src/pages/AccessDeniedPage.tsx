/**
 * AccessDeniedPage
 *
 * Shown inline by GuardWrapper when a user lacks permissions to view a route.
 * Intentionally NOT a redirect — user stays on the same URL so that
 * refreshing or gaining permissions resolves the situation naturally.
 */

import React from "react"

const styles = {
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minHeight: "100dvh",
    flexDirection: "column" as const,
    gap: "8px",
    fontFamily: "Roboto, sans-serif",
    color: "var(--p-color-text-primary, #000)",
    opacity: 0.5,
  },
  icon: { fontSize: "40px" },
  text: { fontSize: "15px" },
}

export const AccessDeniedPage: React.FC = () => (
  <div style={styles.root}>
    <span style={styles.icon}>🔒</span>
    <span style={styles.text}>Нет доступа</span>
  </div>
)
