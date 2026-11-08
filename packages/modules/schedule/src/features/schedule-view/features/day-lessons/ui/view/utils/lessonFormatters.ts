import { LessonEntity } from "../../../model/schemas"

/**
 * Parse time range string "HH:MM-HH:MM" into array of parts
 */
export const parseTimeRange = (timeString: string): string[] => {
  if (!timeString) return []
  return timeString
    .split("-")
    .map((part) => part.trim())
    .filter(Boolean)
}

/**
 * Check if current lesson should display icon/time block
 * (i.e., different from previous pair number)
 */
export const isSamePairAsNext = (
  currentPairNum: string | null,
  nextPairNum: string | null
): boolean => {
  return currentPairNum === nextPairNum
}

/**
 * Get lesson type icon type based on lesson type name
 */
export const getLessonTypeCategory = (
  typeName?: string
): "channel" | "lab" | "user" => {
  if (typeName === "Лекционное занятие") return "channel"
  if (typeName === "Лабораторная работа") return "lab"
  return "user"
}

/**
 * Format lesson metadata based on context (group/teacher/audience)
 */
export const formatLessonMeta = (
  item: LessonEntity | undefined,
  type?: "group" | "teacher" | "audience"
): { groupName?: string; roomName?: string; teacherName?: string } | null => {
  if (!item) return null

  const result: {
    groupName?: string
    roomName?: string
    teacherName?: string
  } = {}

  if (type === "teacher" || type === "audience") {
    if (item.group?.name) result.groupName = item.group.name
  }

  if (item.room?.name) result.roomName = item.room.name

  if (type !== "teacher" && type !== "audience") {
    if (item.teacher?.fioShort) result.teacherName = item.teacher.fioShort
  }

  return Object.keys(result).length > 0 ? result : null
}
