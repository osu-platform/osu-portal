export type ScheduleDay = "today" | "tomorrow" | "other"
export type ScheduleMode = "day" | "session"
export type ScheduleOwnerType = "group" | "teacher" | "audience"

export type FavoriteItem = {
  id: string
  title: string
  type: ScheduleOwnerType
}

export type ScheduleItem = {
  id: string
  time: string
  type: string
  subject: string
  teacher: string
  audience: string
  subgroup?: string
  pair?: number
  details?: ScheduleDetails
}

export type ScheduleDetails = {
  subject?: string
  teacher?: string
  audience?: string
  group?: string
  type?: string
  time?: string
  date?: string
  subgroup?: string
}

export type ScheduleSelectionOption = {
  value: string
  label: string
}

export type ScheduleSelectionOptions = {
  faculties?: ScheduleSelectionOption[]
  flows?: ScheduleSelectionOption[]
  groups?: ScheduleSelectionOption[]
  teachers?: ScheduleSelectionOption[]
  audiences?: ScheduleSelectionOption[]
  departments?: ScheduleSelectionOption[]
  floors?: ScheduleSelectionOption[]
  buildings?: ScheduleSelectionOption[]
}
