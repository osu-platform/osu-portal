/**
 * ErrorPage — System error page
 *
 * Shown when: authState === 'error', unhandled runtime errors
 * Props: message (optional), onRetry (optional)
 */

import React from "react"

export interface ErrorPageProps {
  message?: string
  onRetry?: () => void
}

const styles = {
  root: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100dvh",
    padding: "24px",
    gap: "16px",
    textAlign: "center" as const,
    background: "var(--p-color-bg-secondary, #fff)",
    color: "var(--p-color-text-primary, #000)",
    fontFamily: "Roboto, sans-serif",
  },
  icon: {
    fontSize: "56px",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 600,
  },
  message: {
    margin: 0,
    fontSize: "14px",
    opacity: 0.6,
    maxWidth: "300px",
    lineHeight: 1.5,
  },
  retryButton: {
    marginTop: "8px",
    padding: "12px 32px",
    borderRadius: "12px",
    border: "none",
    background: "var(--p-color-action-primary-bg, #004F9F)",
    color: "var(--p-color-action-primary-text, #fff)",
    fontSize: "15px",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ message, onRetry }) => (
  <div style={styles.root}>
    <div style={styles.icon}>⚠️</div>
    <h2 style={styles.title}>Ошибка инициализации</h2>
    <p style={styles.message}>
      {message ??
        "Не удалось запустить приложение. Проверьте соединение и попробуйте ещё раз."}
    </p>
    {onRetry && (
      <button style={styles.retryButton} onClick={onRetry}>
        Повторить
      </button>
    )}
  </div>
)
