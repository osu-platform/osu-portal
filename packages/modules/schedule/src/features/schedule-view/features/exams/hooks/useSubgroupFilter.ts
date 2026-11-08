import { useCallback, useState } from "react"
import type { LessonEntity } from "../model/schemas"

const STORAGE_PREFIX = "exam_subgroup_filter__"

export interface SubgroupInfo {
  num: string
  abbr: string
}

export interface SubjectWithSubgroups {
  subjectCode: string
  subjectName: string
  subgroups: SubgroupInfo[]
}

/** Ключ скрытия: subjectCode__subgroupNum */
export function makeFilterKey(subjectCode: string, subgroupNum: string) {
  return `${subjectCode}__${subgroupNum}`
}

function loadHidden(groupId: string): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + groupId)
    const arr: string[] = raw ? JSON.parse(raw) : []
    return new Set(arr)
  } catch {
    return new Set()
  }
}

function saveHidden(groupId: string, hidden: Set<string>) {
  localStorage.setItem(STORAGE_PREFIX + groupId, JSON.stringify([...hidden]))
}

/** Возвращает предметы у которых есть больше одной подгруппы */
export function extractSubjectsWithSubgroups(
  items: LessonEntity[]
): SubjectWithSubgroups[] {
  // subjectCode -> subgroupNum -> abbr
  const map = new Map<string, { name: string; subs: Map<string, string> }>()

  for (const item of items) {
    const num = item.group.subgroupNum
    if (!num || num === "0") continue

    if (!map.has(item.subject.code)) {
      map.set(item.subject.code, { name: item.subject.name, subs: new Map() })
    }
    const entry = map.get(item.subject.code)!
    if (!entry.subs.has(num)) {
      entry.subs.set(num, item.group.subgroupAbbr || `Подгр. ${num}`)
    }
  }

  const result: SubjectWithSubgroups[] = []
  for (const [subjectCode, { name, subs }] of map.entries()) {
    if (subs.size < 2) continue // показываем только если подгрупп >= 2
    result.push({
      subjectCode,
      subjectName: name,
      subgroups: [...subs.entries()]
        .map(([num, abbr]) => ({ num, abbr }))
        .sort((a, b) => a.num.localeCompare(b.num)),
    })
  }

  return result
}

export function useSubgroupFilter(groupId: string) {
  const [hidden, setHidden] = useState<Set<string>>(() => loadHidden(groupId))

  const toggle = useCallback(
    (subjectCode: string, subgroupNum: string) => {
      const key = makeFilterKey(subjectCode, subgroupNum)
      setHidden((prev) => {
        const next = new Set(prev)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        saveHidden(groupId, next)
        return next
      })
    },
    [groupId]
  )

  const isVisible = useCallback(
    (item: LessonEntity): boolean => {
      const num = item.group.subgroupNum
      if (!num || num === "0") return true
      return !hidden.has(makeFilterKey(item.subject.code, num))
    },
    [hidden]
  )

  return { hidden, toggle, isVisible }
}
