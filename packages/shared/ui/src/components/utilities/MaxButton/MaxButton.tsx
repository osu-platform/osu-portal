import React from "react"
import styles from "./MaxButton.module.css"

export interface MaxButtonProps {
  /**
   * Обработчик клика по кнопке
   */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void

  /**
   * Отключена ли кнопка
   */
  disabled?: boolean

  /**
   * Текст кнопки
   * @default "Войти через Max"
   */
  label?: string

  /**
   * Тип логирования (для аналитики)
   * @default "max_oauth"
   */
  authType?: string

  /**
   * Дополнительные атрибуты доступности
   */
  ariaLabel?: string

  /**
   * ID элемента для тестирования
   */
  testId?: string

  /**
   * Дополнительные CSS классы
   */
  className?: string

  /**
   * Полный размер контейнера (stretch)
   */
  fullWidth?: boolean
}

/**
 * Компонент кнопки авторизации через MAX
 *
 * Используется для предоставления альтернативного метода входа через систему MAX.
 * Компонент полностью независим и не требует никаких зависимостей от бизнес-логики.
 *
 * @example
 * ```tsx
 * <MaxButton
 *   onClick={() => console.log('MAX auth clicked')}
 *   disabled={isLoading}
 * />
 * ```
 */
const MaxButton = React.forwardRef<HTMLButtonElement, MaxButtonProps>(
  (
    {
      onClick,
      disabled = false,
      label = "Войти через Max",
      authType = "max_oauth",
      ariaLabel = "Авторизация через Max",
      testId = "max-button",
      className = "",
      fullWidth = false,
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && onClick) {
        onClick(e)
      }
    }

    const buttonClassName = [
      styles.button,
      disabled && styles.disabled,
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(" ")

    return (
      <button
        ref={ref}
        type="button"
        className={buttonClassName}
        onClick={handleClick}
        disabled={disabled}
        aria-label={ariaLabel}
        data-testid={testId}
        data-auth-type={authType}
      >
        <span className={styles.logoContainer}>
          <img
            src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22120%22%20height%3D%2280%22%3E%3Crect%20width%3D%22120%22%20height%3D%2280%22%20fill%3D%22%23dae8fa%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2240%22%20r%3D%2220%22%20fill%3D%22%23426da9%22%2F%3E%3C%2Fsvg%3E"
            alt="MAX"
            className={styles.logoImage}
            width={24}
            height={24}
            aria-hidden="true"
          />
        </span>
        <span className={styles.label}>{label}</span>
      </button>
    )
  }
)

MaxButton.displayName = "MaxButton"

export default MaxButton
