import { useEffect, useState } from "react"
import { ScheduleList } from "./ScheduleList"
import { useScheduleView } from "../../../../model/useScheduleView"
import { LessonEntity } from "../../model/schemas"

type Props = {
  onSelect?: (item: LessonEntity) => void
  data: LessonEntity[]
  date: string
}

export const Schedule = ({ date, onSelect, data }: Props) => {
  const { isLoading, confirmed } = useScheduleView()
  const [lessons, setLessons] = useState<LessonEntity[]>([])

  useEffect(() => {
    const items = data
      ? data.sort((a, b) => Number(a.pairNum) - Number(b.pairNum))
      : []

    setLessons(items)
  }, [data, confirmed.id, date])

  return (
    <ScheduleList
      type={confirmed.type as "group" | "teacher" | "audience"}
      items={lessons}
      loading={isLoading}
      onSelect={onSelect}
    />
  )
}
