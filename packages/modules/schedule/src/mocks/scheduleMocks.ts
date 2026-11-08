import type {
  FavoriteItem,
  ScheduleDay,
  ScheduleDetails,
  ScheduleItem,
  ScheduleMode,
  ScheduleSelectionOptions,
} from "../features/schedule-view/features/day-lessons/types/ui"

export const mockScheduleDetails: ScheduleDetails = {
  subject: "Информационные технологии",
  teacher: "Демонстрационный преподаватель",
  audience: "2-217",
  group: "25ИСТ(6)-1",
  type: "Лекционное занятие",
  time: "11:20-12:50",
  date: "2026-04-29",
  subgroup: "Подгруппа 1",
}

export const mockScheduleItems: ScheduleItem[] = [
  {
    id: "lesson-1",
    time: "11:20-12:50",
    type: "Лекционное занятие",
    subject: "ИТ",
    teacher: "Демонстрационный преподаватель",
    audience: "2-217",
    pair: 3,
    details: mockScheduleDetails,
  },
  {
    id: "lesson-2",
    time: "13:20-14:50",
    type: "Лабораторная работа",
    subject: "ИТ",
    teacher: "Демонстрационный преподаватель",
    audience: "3-301",
    pair: 4,
    details: {
      ...mockScheduleDetails,
      type: "Лабораторная работа",
      time: "13:20-14:50",
      audience: "3-301",
    },
  },
]

export const mockFavorites: FavoriteItem[] = [
  { id: "group-25ist", title: "25ИСТ(6)-1", type: "group" },
  { id: "demo-teacher", title: "Демонстрационный преподаватель", type: "teacher" },
]

export const mockSelectionOptions: ScheduleSelectionOptions = {
  faculties: [
    { value: "f-1", label: "ФИТ" },
    { value: "f-2", label: "ФЭУ" },
  ],
  flows: [
    { value: "flow-1", label: "Поток 1" },
    { value: "flow-2", label: "Поток 2" },
  ],
  groups: [
    { value: "g-1", label: "25ИСТ(6)-1" },
    { value: "g-2", label: "25ИСТ(6)-2" },
  ],
  teachers: [
    { value: "t-1", label: "Демонстрационный преподаватель" },
    { value: "t-2", label: "Иванов И.И." },
  ],
  audiences: [
    { value: "a-1", label: "2-217" },
    { value: "a-2", label: "3-301" },
  ],
  departments: [
    { value: "d-1", label: "Кафедра ИТ" },
    { value: "d-2", label: "Кафедра МО" },
  ],
  buildings: [
    { value: "b-1", label: "Корпус 2" },
    { value: "b-2", label: "Корпус 3" },
  ],
  floors: [
    { value: "f-1", label: "2 этаж" },
    { value: "f-2", label: "3 этаж" },
  ],
}

export const mockDay: ScheduleDay = "today"
export const mockMode: ScheduleMode = "day"
