import { useMemo } from "react"
import { useParams } from "react-router-dom"
import dayjs from "dayjs"
import { LessonMapper } from "../model/mapper"
import { useTestsByGroup } from "../api/queries"
import type { LessonEntity } from "../model/schemas"

type SessionPeriod = "winter" | "summer"

function detectPeriod(now: dayjs.Dayjs): SessionPeriod {
  const month = now.month() + 1 // 1-12
  // Winter session: Nov–Feb (exams in Dec–Feb)
  // Summer session: Apr–Sep (exams in May–Aug)
  if (month >= 11 || month <= 3) return "winter"
  return "summer"
}

function filterByPeriod(items: LessonEntity[], period: SessionPeriod): LessonEntity[] {
  return items.filter((item) => {
    const month = dayjs(item.realDay).month() + 1
    if (period === "winter") return month === 12 || month === 1 || month === 2
    return month >= 5 && month <= 8
  })
}

export function useTests() {
  const { type, id } = useParams()

  const testsQuery = useTestsByGroup(type === "group" ? (id as string) : null)

  const data = useMemo(() => {
    if (!testsQuery.data) return []
    const all = LessonMapper.fromEntries(testsQuery.data as any)
    const period = detectPeriod(dayjs())
    const filtered = filterByPeriod(all, period)
    return filtered.sort((a, b) => a.realDay.localeCompare(b.realDay))
  }, [id, type, testsQuery.data])

  return {
    data,
    isLoading: testsQuery.isLoading,
    isError: testsQuery?.isError ?? false,
    confirmed: { type, id },
  }
}
