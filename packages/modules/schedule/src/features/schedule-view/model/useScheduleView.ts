import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import {
  useClassesQuery,
  useLessonsByTeacherQuery,
  useLessonsByAudienceQuery,
} from "../features/day-lessons/api/queries"
import { LessonMapper } from "../features/day-lessons/model/mapper"

export function useScheduleView() {
  const { type, id } = useParams()
  const [isLoading, setIsLoading] = useState(true)

  const classesQuery = useClassesQuery(type === "group" ? (id as string) : null)
  const teacherQuery = useLessonsByTeacherQuery(
    type === "teacher" ? (id as string) : null
  )
  const audienceQuery = useLessonsByAudienceQuery(
    type === "audience" ? (id as string) : null
  )

  const data = useMemo(() => {
    if (type === "group" && classesQuery.data)
      return LessonMapper.fromEntries(classesQuery.data as any)
    if (type === "teacher" && teacherQuery.data)
      return LessonMapper.fromEntries(teacherQuery.data as any)
    if (type === "audience" && audienceQuery.data)
      return LessonMapper.fromEntries(audienceQuery.data as any)
    return []
  }, [id, type, classesQuery.data, teacherQuery.data, audienceQuery.data])


  const activeQuery =
    type === "group"
      ? classesQuery
      : type === "teacher"
        ? teacherQuery
        : type === "audience"
          ? audienceQuery
          : null

  useEffect(() => {
    setIsLoading(activeQuery?.isLoading ?? false)
  }, [activeQuery?.isLoading ])


  return {
    data,
    isLoading,
    isError: activeQuery?.isError ?? false,
    confirmed: { type, id },
  }
}
