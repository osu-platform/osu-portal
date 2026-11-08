import { ReactNode } from "react"
import { Cell, Skeleton, Subheadline, Text } from "@portal/shared-ui"
import { LessonTitle } from "./LessonTitle"
import styles from "./LessonSection.module.css"

export type LessonSectionMode = "active" | "past" | "future" | "skeleton"

export type LessonSectionProps = {
  icon?: ReactNode
  subtitle?: ReactNode | string
  title?: ReactNode | string
  shortTitle?: string
  description?: ReactNode
  number?: string | number | null
  time?: [ReactNode, ReactNode] | []
  mode?: LessonSectionMode
  onClick?: () => void
}

export const LessonSection = ({
  icon,
  subtitle,
  title,
  shortTitle,
  description,
  number,
  time = [],
  mode = "future",
  onClick,
}: LessonSectionProps) => {
  if (mode === "skeleton") {
    return (
      <div className={styles.root}>
        <Cell
          style={{ backgroundColor: "var(--p-color-surface-section)" }}
          before={
            //   <Skeleton visible={true} style={{ width: 26, height: 26 }} />
            <span className={styles.iconSpacer} />
          }
          description={
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ height: 0 }} />
              <Skeleton visible={true} style={{ width: 70, height: 23 }} />
              <Skeleton visible={true} style={{ width: 80, height: 23 }} />
            </div>
          }
          //   after={
          //     <div className={styles.time}>
          //       <Skeleton visible={true} style={{ width: 26, height: 26 }} />
          //       <div className={styles.timeRange}>
          //         <Skeleton visible={true} style={{ width: 35, height: 22 }} />
          //         <Skeleton visible={true} style={{ width: 35, height: 22 }} />
          //       </div>
          //     </div>
          //   }
        >
          <Skeleton visible={true} style={{ width: 100, height: 20 }} />
          <div style={{ height: 6 }} />
          <Skeleton visible={true} style={{ width: 250, height: 25 }} />
        </Cell>
      </div>
    )
  }

  const after = (
    <div className={styles.time}>
      {number && <Text className={styles.pair}>{number}</Text>}
      {time.length > 0 && (
        <div className={styles.timeRange}>
          {time.map((part, index) => (
            <Subheadline key={index} level="2" weight="2">
              {part}
            </Subheadline>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className={styles.root} data-mode={mode}>
      <Cell
        before={icon ?? <span className={styles.iconSpacer} />}
        onClick={onClick}
        description={description}
        after={after}
        style={{ backgroundColor: "var(--p-color-surface-section)" }}
      >
        {subtitle && (
          <Subheadline level="2" weight="2" className={styles.type}>
            {subtitle}
          </Subheadline>
        )}

        {typeof title === "string" ? (
          <LessonTitle name={title} shortName={shortTitle} />
        ) : (
          <Text wrap="wrap" className={styles.subject}>
            {title}
          </Text>
        )}
      </Cell>
    </div>
  )
}

export default LessonSection
