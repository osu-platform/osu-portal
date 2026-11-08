import { Chip, Modal, Title } from "@portal/shared-ui"
import dayjs from "dayjs"
import styles from "./ClassDetailsModal.module.css"
import { LessonEntity } from "../../model/schemas"
import { Link, useParams } from "react-router-dom"

type ClassDetailsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: LessonEntity | null
}

const formatDate = (value?: string) => {
  if (!value) return undefined
  const d = dayjs(value)
  return d.isValid() ? d.format("DD.MM.YYYY") : value
}

export const ClassDetailsModal = ({
  open,
  onOpenChange,
  item,
}: ClassDetailsModalProps) => {
  const { id } = useParams()
  return (
    <Modal open={open} onOpenChange={onOpenChange} header={<Modal.Header />}>
      <div className={styles.content}>
        <Title level="2" weight="2" className={styles.title}>
          {item?.subject.name || "Занятие"}
        </Title>

        {item && (
          <div className={styles.chips}>
            {item.type.name && <Chip>{item.type.name}</Chip>}

            {item.teacher?.fio && id === item.teacher.id ? (
              <Chip>{item.teacher.fio}</Chip>
            ) : (
              <Chip
                onClick={() => {
                  onOpenChange(false)
                }}
              >
                <Link to={`/schedule/teacher/${item.teacher.id}/day`}>
                  {item.teacher.fio}
                </Link>
              </Chip>
            )}

            {item.pairNum && <Chip>{item.pairNum} пара</Chip>}

            {item.room?.name && id === item.room.id ? (
              <Chip>{item.room.name}</Chip>
            ) : (
              item.room.name && (
                <Chip
                  onClick={() => {
                    onOpenChange(false)
                  }}
                >
                  <Link to={`/schedule/audience/${item.room.id}/day`}>
                    {item.room.name}
                  </Link>
                </Chip>
              )
            )}

            {item.group?.name && id === item.group.code ? (
              <Chip>{item.group.name}</Chip>
            ) : (
              <Chip
                onClick={() => {
                  onOpenChange(false)
                }}
              >
                <Link to={`/schedule/group/${item.group.code}/day`}>
                  {item.group.name}
                </Link>
              </Chip>
            )}

            {item.group?.subgroupAbbr && <Chip>{item.group.subgroupAbbr}</Chip>}

            {item.realDay && <Chip>{formatDate(item.realDay)}</Chip>}

            {item.description && <Chip>{formatDate(item.description)}</Chip>}
          </div>
        )}
      </div>
    </Modal>
  )
}
