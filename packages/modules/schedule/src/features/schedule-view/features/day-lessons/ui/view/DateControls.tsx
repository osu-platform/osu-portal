import { IconButton } from "@portal/shared-ui"
import { DatePicker } from "antd"
import dayjs from "dayjs"
import styles from "./DateControls.module.css"
import { Icon24ChevronLeft, Icon24ChevronRight } from "@portal/shared-assets"

type DateControlsProps = {
  value: string
  onChange: (value: string) => void
  onPrev?: () => void
  onNext?: () => void
}

export const DateControls = ({
  value,
  onChange,
  onPrev,
  onNext,
}: DateControlsProps) => {
  const current = value ? dayjs(value) : null

  return (
    <div className={styles.wrapper}>
      <IconButton
        mode="gray"
        size="m"
        onClick={onPrev}
        aria-label="Предыдущая дата"
      >
        <Icon24ChevronLeft />
      </IconButton>
      <DatePicker
        style={{
          width: "100%",
          outline: "none",
          borderRadius: ".8rem",
          padding: ".5rem",
          fontSize: "0",
        }}
        mode="date"
        format={(value) => (value ? value.format("dd DD.MM.YYYY") : "")}
        placeholder="Выберите дату"
        value={current}
        onChange={(next) => onChange(next ? next.format("YYYY-MM-DD") : "")}
        className={styles.datePicker}
      />
      <IconButton
        mode="gray"
        size="m"
        onClick={onNext}
        aria-label="Следующая дата"
      >
        <Icon24ChevronRight />
      </IconButton>
    </div>
  )
}
