import { Subheadline } from "@portal/shared-ui"
import styles from "./ScheduleWidget.module.css"

export const ScheduleWidget = () => (
  <section className={styles.widget}>
    <div className={styles.header}>
      <Subheadline level="1" weight="2">
        Сегодня
      </Subheadline>
    </div>
  </section>
)
