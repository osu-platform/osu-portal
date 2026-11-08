/**
 * SimpleLayout — Layout for simple pages
 */

import React from "react"
import type { ReactNode } from "react"

export interface SimpleLayoutProps {
  children?: ReactNode
}

const styles = {
  root: {
    display: "flex",
    flexDirection: "column" as const,
    height: "100dvh",
    background: "var(--p-color-bg-secondary)",
    color: "var(--p-color-accent)",
    fontFamily: "Roboto, sans-serif",
  },
  main: {
    flex: 1,
    overflowY: "auto" as const,
  },
}

export const SimpleLayout: React.FC<SimpleLayoutProps> = ({ children }) => {
  return (
    <div style={styles.root}>
      <main style={styles.main}>{children}</main>
    </div>
  )
}
