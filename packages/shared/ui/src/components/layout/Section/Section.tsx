import React, { useState } from "react"
import styles from "./Section.module.css"

export interface SectionProps {
  /**
   * Заголовок секции
   */
  title: string

  /**
   * Содержимое секции
   */
  children: React.ReactNode

  /**
   * Текст кнопки управления справа от заголовка
   */
  controlText?: string

  /**
   * Обработчик клика по кнопке управления
   */
  onControlClick?: () => void

  /**
   * Показывать ли кнопку сворачивания/разворачивания
   */
  collapsible?: boolean

  /**
   * Развернута ли секция по умолчанию (работает только с collapsible=true)
   */
  defaultExpanded?: boolean

  /**
   * Пользовательский цвет фона
   */
  background?: string

  /**
   * Дополнительные стили для контейнера
   */
  style?: React.CSSProperties

  /**
   * Дополнительные стили для контента
   */
  contentStyle?: React.CSSProperties

  /**
   * CSS класс для контейнера
   */
  className?: string

  /**
   * Широкий контент (без внутренних отступов)
   */
  isContentWide?: boolean
}

/**
 * Section - секция с заголовком и содержимым
 *
 * Универсальный компонент для группировки контента с заголовком.
 * Поддерживает сворачивание, кастомные кнопки управления и темизацию.
 *
 * @example
 * ```tsx
 * <Section title="Заголовок">
 *   <div>Содержимое секции</div>
 * </Section>
 *
 * <Section
 *   title="Сворачиваемая секция"
 *   collapsible
 *   defaultExpanded={false}
 * >
 *   <div>Содержимое</div>
 * </Section>
 *
 * <Section
 *   title="С действием"
 *   controlText="Показать все"
 *   onControlClick={() => console.log('Clicked')}
 * >
 *   <div>Содержимое</div>
 * </Section>
 * ```
 */
const Section: React.FC<SectionProps> = ({
  title,
  children,
  controlText,
  onControlClick,
  collapsible = false,
  defaultExpanded = true,
  background,
  style,
  contentStyle,
  className,
  isContentWide = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const handleExpandToggle = () => {
    setIsExpanded((prev) => !prev)
  }

  return (
    <section
      className={`${styles.section} ${className || ""}`}
      style={{
        ...(background && { backgroundColor: background }),
        ...style,
      }}
    >
      <div className={styles.section__header}>
        <div className={styles.section__title}>{title}</div>

        <div className={styles.section__controls}>
          {collapsible && (
            <div
              className={`${styles.section__expand_button} ${
                !isExpanded ? styles["section__expand_button--collapsed"] : ""
              }`}
              onClick={handleExpandToggle}
              role="button"
              aria-label={isExpanded ? "Свернуть" : "Развернуть"}
              aria-expanded={isExpanded}
            >
              <svg
                width="14"
                height="8"
                viewBox="0 0 14 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.292893 0.292893C0.683417 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L7 5.58579L12.2929 0.292893C12.6834 -0.0976311 13.3166 -0.0976311 13.7071 0.292893C14.0976 0.683418 14.0976 1.31658 13.7071 1.70711L7.70711 7.70711C7.31658 8.09763 6.68342 8.09763 6.29289 7.70711L0.292893 1.70711C-0.0976311 1.31658 -0.0976311 0.683418 0.292893 0.292893Z"
                />
              </svg>
            </div>
          )}

          {controlText && (
            <div
              className={styles.section__control_text}
              onClick={onControlClick}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onControlClick?.()
                }
              }}
            >
              {controlText}
            </div>
          )}
        </div>
      </div>

      <div
        className={`${styles.section__content} ${
          collapsible && !isExpanded
            ? styles["section__content--collapsed"]
            : styles["section__content--expanded"]
        }`}
        style={{
          ...(background && { backgroundColor: background }),
          ...(isContentWide && { padding: "1rem 0" }),
          ...contentStyle,
        }}
      >
        {children}
      </div>
    </section>
  )
}

export default Section
