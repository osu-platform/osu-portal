import { SegmentedControl } from "@portal/shared-ui"
import styles from "./DayTabs.module.css"
import { TODAY, TOMORROW } from "../../helpers/constants"
import dayjs from "dayjs"

type DayTabsProps = {
  value: string
  onChange: (day: string) => void
}

export const DayTabs = ({ value, onChange }: DayTabsProps) => (
  <div className={styles.wrapper}>
    <SegmentedControl>
      <SegmentedControl.Item
        selected={value === TODAY}
        onClick={() => onChange(TODAY)}
      >
        Сегодня
      </SegmentedControl.Item>
      <SegmentedControl.Item
        selected={value === TOMORROW}
        onClick={() => onChange(TOMORROW)}
      >
        Завтра
      </SegmentedControl.Item>
      <SegmentedControl.Item
        selected={value !== TODAY && value !== TOMORROW}
        onClick={() =>
          onChange(dayjs(TOMORROW).add(1, "day").format("YYYY-MM-DD"))
        }
      >
        Другое
      </SegmentedControl.Item>
    </SegmentedControl>
  </div>
)
