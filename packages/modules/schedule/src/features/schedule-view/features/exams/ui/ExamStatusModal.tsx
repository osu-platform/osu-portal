import { useState } from "react"
import { Button, Chip, Modal, Title } from "@portal/shared-ui"
import { Confetti } from "@neoconfetti/react"
import dayjs from "dayjs"
import "dayjs/locale/ru"
import { Link, useParams } from "react-router-dom"
import type { ExamStatus } from "../hooks/useExamStatus"
import type { ExamGroup } from "../model/groupExams"
import styles from "./ExamStatusModal.module.css"

type Props = {
  examGroup: ExamGroup | null
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStatus: ExamStatus
  onSetStatus: (status: ExamStatus) => void
}

const formatDate = (value?: string) => {
  if (!value) return undefined
  const d = dayjs(value)
  return d.isValid() ? d.locale("ru").format("D MMMM YYYY") : value
}

export const ExamStatusModal = ({
  examGroup,
  open,
  onOpenChange,
  currentStatus,
  onSetStatus,
}: Props) => {
  const [showConfetti, setShowConfetti] = useState(false)
  const { id } = useParams()

  if (!examGroup) return null

  const { item, pairLabel, timeLabel } = examGroup

  const handlePassed = () => {
    const next: ExamStatus = currentStatus === "passed" ? null : "passed"
    onSetStatus(next)
    if (next === "passed") {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }

  const handleFailed = () => {
    onSetStatus(currentStatus === "failed" ? null : "failed")
  }

  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) setShowConfetti(false)
      }}
      header={<Modal.Header />}
    >
      {showConfetti && (
        <div className={styles.confetti}>
          <Confetti particleCount={120} />
        </div>
      )}

      <div className={styles.content}>
        <Title level="2" weight="2" className={styles.title}>
          {item.subject.name}
        </Title>

        <div className={styles.chips}>
          {item.type.name && <Chip>{item.type.name}</Chip>}

          {item.teacher?.fio && (
            <Chip onClick={() => onOpenChange(false)}>
              <Link to={`/schedule/teacher/${item.teacher.id}/day`}>
                {item.teacher.fio}
              </Link>
            </Chip>
          )}

          {item.room?.name &&
            (id === item.room.id ? (
              <Chip>ауд. {item.room.name}</Chip>
            ) : (
              <Chip onClick={() => onOpenChange(false)}>
                <Link to={`/schedule/audience/${item.room.id}/day`}>
                  ауд. {item.room.name}
                </Link>
              </Chip>
            ))}

          {item.realDay && <Chip>{formatDate(item.realDay)}</Chip>}
          {timeLabel && <Chip>{timeLabel}</Chip>}
          {pairLabel && <Chip>{pairLabel}</Chip>}
          {item.group?.subgroupAbbr && <Chip>{item.group.subgroupAbbr}</Chip>}
        </div>

        <div className={styles.buttons}>
          <Button
            size="m"
            stretched
            mode={currentStatus === "passed" ? "filled" : "gray"}
            style={
              currentStatus === "passed"
                ? ({ "--p-color-action-primary-bg": "#34c759" } as React.CSSProperties)
                : {}
            }
            onClick={handlePassed}
          >
            Сдал
          </Button>
          <Button
            size="m"
            stretched
            mode={currentStatus === "failed" ? "filled" : "gray"}
            style={
              currentStatus === "failed"
                ? ({
                    "--p-color-action-primary-bg": "#ff3b30",
                  } as React.CSSProperties)
                : {}
            }
            onClick={handleFailed}
          >
            Не сдал
          </Button>
        </div>
      </div>
    </Modal>
  )
}
