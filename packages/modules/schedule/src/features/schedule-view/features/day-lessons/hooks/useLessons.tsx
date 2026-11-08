import { useEffect, useState } from "react"
import { useScheduleView } from "../../../model/useScheduleView"
import { LessonEntity } from "../model/schemas"

const useLessons = () => {
  const { data, confirmed } = useScheduleView()
  const [lessons, setLessons] = useState<Record<string, LessonEntity[]>>({})

  useEffect(() => {
    const newLessons: { [key: string]: LessonEntity[] } = {}

    data.map((item) => {
      if (newLessons[item.realDay]) {
        newLessons[item.realDay] = [...newLessons[item.realDay], item]
      } else {
        newLessons[item.realDay] = [item]
      }
    })

    setLessons(newLessons)
  }, [data, confirmed.id])

  return lessons
}

export default useLessons
