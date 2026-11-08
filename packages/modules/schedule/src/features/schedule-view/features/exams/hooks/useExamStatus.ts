import { useCallback, useEffect, useState } from "react"

export type ExamStatus = "passed" | "failed" | null

const STORAGE_KEY = "exam_statuses"

export function makeExamKey(
  groupId: string,
  subjectCode: string,
  realDay: string,
  subgroupNum: string
): string {
  return `${groupId}__${subjectCode}__${realDay}__${subgroupNum}`
}

function loadStatuses(): Record<string, ExamStatus> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveStatuses(statuses: Record<string, ExamStatus>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses))
}

export function useExamStatus(groupId: string) {
  const [statuses, setStatuses] = useState<Record<string, ExamStatus>>(() =>
    loadStatuses()
  )

  useEffect(() => {
    const handler = () => setStatuses(loadStatuses())
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  const getStatus = useCallback(
    (subjectCode: string, realDay: string, subgroupNum: string): ExamStatus => {
      const key = makeExamKey(groupId, subjectCode, realDay, subgroupNum)
      return statuses[key] ?? null
    },
    [statuses, groupId]
  )

  const setStatus = useCallback(
    (
      subjectCode: string,
      realDay: string,
      subgroupNum: string,
      status: ExamStatus
    ) => {
      const key = makeExamKey(groupId, subjectCode, realDay, subgroupNum)
      const updated = { ...loadStatuses(), [key]: status }
      saveStatuses(updated)
      setStatuses(updated)
    },
    [groupId]
  )

  return { getStatus, setStatus }
}
