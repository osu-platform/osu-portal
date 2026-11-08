import dayjs from "dayjs"
import { ScheduleDay } from "../types/ui"

export const TODAY = dayjs().format("YYYY-MM-DD")
export const TOMORROW = dayjs().add(1, "day").format("YYYY-MM-DD")

export const DAY_TO_INDEX: Record<ScheduleDay, number> = {
  today: 0,
  tomorrow: 1,
  other: 2,
}

export const INDEX_TO_DAY: Record<number, ScheduleDay> = {
  0: "today",
  1: "tomorrow",
  2: "other",
}
