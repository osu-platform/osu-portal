import type { LessonEntity } from "./schemas"

function parseTimeRange(description: string): string[] {
  if (!description) return []
  return description
    .split("-")
    .map((p) => p.trim())
    .filter(Boolean)
}

function buildTimeLabel(first: LessonEntity, last: LessonEntity): string {
  const firstParts = parseTimeRange(first.description ?? "")
  const lastParts = parseTimeRange(last.description ?? "")
  const start = firstParts[0]
  const end = lastParts.length >= 2 ? lastParts[1] : lastParts[0]
  if (start && end) return `${start}–${end}`
  return start ?? ""
}

export interface ExamGroup {
  /** Ключ группы для идентификации */
  key: string
  /** Представитель группы (первый элемент) */
  item: LessonEntity
  /** Все пары входящие в группу */
  pairs: LessonEntity[]
  /** Номера пар через запятую / диапазон, например "1–3" или "1, 3" */
  pairLabel: string
  /** Временной диапазон "hh:mm–hh:mm" от начала первой до конца последней пары */
  timeLabel: string
}

function buildPairLabel(nums: number[]): string {
  if (nums.length === 0) return ""
  if (nums.length === 1) return `${nums[0]} пара`

  // Проверяем, идут ли номера подряд
  const sorted = [...nums].sort((a, b) => a - b)
  let isConsecutive = true
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) {
      isConsecutive = false
      break
    }
  }

  if (isConsecutive) {
    return `${sorted[0]}–${sorted[sorted.length - 1]} пара`
  }
  return sorted.join(", ") + " пара"
}

export function groupExams(items: LessonEntity[]): ExamGroup[] {
  const map = new Map<string, LessonEntity[]>()

  for (const item of items) {
    // Группируем по дате + предмет + подгруппа
    const key = `${item.realDay}__${item.subject.code}__${item.group.subgroupNum}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  }

  const result: ExamGroup[] = []
  for (const [key, pairs] of map.entries()) {
    const sorted = [...pairs].sort(
      (a, b) => Number(a.pairNum) - Number(b.pairNum)
    )
    const pairNums = sorted
      .map((p) => Number(p.pairNum))
      .filter((n) => !isNaN(n) && n > 0)

    result.push({
      key,
      item: sorted[0],
      pairs: sorted,
      pairLabel: buildPairLabel(pairNums),
      timeLabel: buildTimeLabel(sorted[0], sorted[sorted.length - 1]),
    })
  }

  // Сортируем по дате, затем по первой паре
  return result.sort((a, b) => {
    const byDay = a.item.realDay.localeCompare(b.item.realDay)
    if (byDay !== 0) return byDay
    return Number(a.item.pairNum) - Number(b.item.pairNum)
  })
}
