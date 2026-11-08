import { Skeleton, Timeline, TimelineItem} from "@portal/shared-ui"
import styles from "./ExamsSkeleton.module.css"

const SKELETON_COUNT = 6

export const ExamsSkeleton = () => (
  <>
    <div className={styles.filterRow}>
      <Skeleton visible style={{ width: 110, height: 34, borderRadius: 999 }} />
    </div>

    <Timeline active={-1}>
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <TimelineItem key={i} className={styles.item}>
          <div className={styles.row}>
            <Skeleton visible style={{ width: 130 + (i % 3) * 30, height: 16, borderRadius: 6 }} />
            <Skeleton visible style={{ width: 80 + (i % 2) * 40, height: 14, borderRadius: 6 }} />
          </div>
        </TimelineItem>
      ))}
    </Timeline>
  </>
)
