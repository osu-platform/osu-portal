import { Placeholder, Text } from "@portal/shared-ui"
import { Channel, Lab, notFoundAnimation, User } from "@portal/shared-assets"
import styles from "./ScheduleList.module.css"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { useEffect, useRef } from "react"
import LessonSection from "./LessonSection"
import { LessonEntity } from "../../model/schemas"
import { parseTimeRange } from "./utils/lessonFormatters"

type ScheduleListProps = {
  items: LessonEntity[]
  onSelect?: (item: LessonEntity) => void
  loading?: boolean
  type?: "group" | "teacher" | "audience"
}

const mapLessonTypeToIcon = (typeName?: string) => {
  if (typeName === "Лекционное занятие") return <Channel />
  if (typeName === "Лабораторная работа") return <Lab />
  return <User />
}

/**
 * Renders lesson metadata (group/teacher/room) with safe null checks
 */
const renderMeta = (
  item: LessonEntity,
  type?: "group" | "teacher" | "audience"
) => {
  if (type === "teacher" || type === "audience") {
    return (
      <div className={styles.meta}>
        {item.group?.name && <Text>{item.group.name}</Text>}
        {item.room?.name && <Text>{item.room.name}</Text>}
      </div>
    )
  }
  return (
    <div className={styles.meta}>
      {item.teacher?.fioShort && <Text>{item.teacher.fioShort}</Text>}
      {item.room?.name && <Text>{item.room.name}</Text>}
    </div>
  )
}

const AnimatedPlaceholder = ({ animation }: { animation: any }) => {
  const instanceRef = useRef<any>(null)
  useEffect(() => {
    const interval = setInterval(() => {
      instanceRef.current?.seek?.(0)
      instanceRef.current?.play?.()
    }, 3500)
    return () => clearInterval(interval)
  }, [])
  return (
    <DotLottieReact
      data={animation}
      autoplay
      loop={false}
      dotLottieRefCallback={(instance) => {
        instanceRef.current = instance
      }}
    />
  )
}

export const ScheduleList = ({
  items,
  onSelect,
  loading,
  type,
}: ScheduleListProps) => {
  return (
    <div className={styles.list}>
      {loading &&
        Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className={styles.placeholder}>
            <LessonSection mode="skeleton" title="" />
          </div>
        ))}
      {!loading && items.length === 0 && (
        <div className={styles.empty}>
          <Placeholder
            header="Нет занятий на этот день"
            description="Может быть, это выходной?"
          >
            <AnimatedPlaceholder animation={notFoundAnimation} />
          </Placeholder>
        </div>
      )}
      {!loading &&
        (() => {
          const result: React.ReactNode[] = []

          for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const timeRangeParts = parseTimeRange(item.description ?? "")

            let description = renderMeta(item, type)

            // схлопывание одинаковых пар
            while (
              i + 1 < items.length &&
              items[i + 1].pairNum === item.pairNum
            ) {
              const next = items[i + 1]

              description = (
                <>
                  {description}
                  <div style={{ marginTop: 4 }}>{renderMeta(next, type)}</div>
                </>
              )

              i++ // двигаем указатель
            }

            result.push(
              <LessonSection
                key={`${item.pairNum}-${i}`}
                icon={mapLessonTypeToIcon(item.type?.name)}
                subtitle={item.type?.name}
                title={item.subject?.name}
                shortTitle={item.subject?.shortName}
                description={description}
                time={[timeRangeParts[0], timeRangeParts[1]]}
                number={item.pairNum}
                onClick={() => onSelect?.(item)} // TODO: Добавить обработку подгрупп
              />
            )
          }

          return result
        })()}
    </div>
  )
}
