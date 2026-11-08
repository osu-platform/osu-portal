/**
 * NotFoundPage — 404 page
 *
 * Shown when: route does not match any known path
 */

import React from "react"

const styles = {
  root: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    padding: "24px",
    gap: "12px",
    textAlign: "center" as const,
  },
  code: {
    fontSize: "72px",
    fontWeight: 800,
    margin: 0,
    opacity: 0.12,
    lineHeight: 1,
  },
  icon: {
    fontSize: "48px",
    marginTop: "-16px",
  },
  title: {
    fontSize: "18px",
    fontWeight: 600,
    margin: 0,
  },
  desc: {
    fontSize: "14px",
    opacity: 0.55,
    margin: 0,
    maxWidth: "260px",
    lineHeight: 1.5,
  },
  backButton: {
    marginTop: "8px",
    padding: "11px 28px",
    borderRadius: "12px",
    border: "none",
    background: "var(--p-color-action-primary-bg, #004F9F)",
    color: "var(--p-color-action-primary-text, #fff)",
    fontSize: "15px",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    textDecoration: "none",
    display: "inline-block",
  },
}

export const NotFoundPage: React.FC = () => {
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = "/"
    }
  }

  return (
    <div style={styles.root}>
      <p style={styles.code}>404</p>
      <div style={styles.icon}>🔍</div>
      <h2 style={styles.title}>Страница не найдена</h2>
      <p style={styles.desc}>
        Такой страницы не существует или она была перемещена.
      </p>
      <button style={styles.backButton} onClick={handleBack}>
        Вернуться назад
      </button>
    </div>
  )
}
