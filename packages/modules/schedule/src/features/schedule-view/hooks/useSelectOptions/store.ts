import { create } from "zustand"
import type { ScheduleOwnerType } from "../../features/day-lessons/types/ui"

type GroupSelection = {
  faculty?: string
  flow?: string
  group?: string
}
type TeacherSelection = {
  faculty?: string
  department?: string
  teacher?: string
}
type AudienceSelection = {
  building?: string
  floor?: string
  audience?: string
}

type ScheduleTarget =
  | { type: "group"; id: string }
  | { type: "teacher"; id: string }
  | { type: "audience"; id: string }
  | null

type ScheduleSelectState = {
  active: ScheduleOwnerType
  group: GroupSelection
  teacher: TeacherSelection
  audience: AudienceSelection
  confirmed: ScheduleTarget
  scheduleTitle: string

  setScheduleTitle: (value: string) => void
  setActive: (tab: ScheduleOwnerType) => void
  setGroup: (patch: Partial<GroupSelection>) => void
  setTeacher: (patch: Partial<TeacherSelection>) => void
  setAudience: (patch: Partial<AudienceSelection>) => void
  setGroupFull: (patch: GroupSelection) => void
  setTeacherFull: (patch: TeacherSelection) => void
  setAudienceFull: (patch: AudienceSelection) => void
  confirm: () => void
}

export const useScheduleSelectStore = create<ScheduleSelectState>(
  (set, get) => ({
    active: "group",
    faculty: {},
    department: {},
    year: {},
    group: {},
    teacher: {},
    building: {},
    storey: {},
    audience: {},
    scheduleTitle: "Расписание",
    confirmed: null,

    setScheduleTitle: (value: string) => {
      set({ scheduleTitle: value })
    },

    setActive: (tab) => set({ active: tab }),

    setGroup: (patch) =>
      set((s) => {
        if (patch.faculty !== undefined) {
          return { group: { faculty: patch.faculty } } // сброс flow и group
        }
        if (patch.flow !== undefined) {
          return { group: { faculty: s.group.faculty, flow: patch.flow } } // сброс group
        }
        return { group: { ...s.group, ...patch } }
      }),

    setTeacher: (patch) =>
      set((s) => {
        if (patch.faculty !== undefined) {
          return { teacher: { faculty: patch.faculty } } // сброс department и teacher
        }
        if (patch.department !== undefined) {
          return {
            teacher: {
              faculty: s.teacher.faculty,
              department: patch.department,
            },
          } // сброс teacher
        }
        return { teacher: { ...s.teacher, ...patch } }
      }),

    setAudience: (patch) =>
      set((s) => {
        if (patch.building !== undefined) {
          return { audience: { building: patch.building } } // сброс floor и audience
        }
        if (patch.floor !== undefined) {
          return {
            audience: { building: s.audience.building, floor: patch.floor },
          } // сброс audience
        }
        return { audience: { ...s.audience, ...patch } }
      }),

    setGroupFull: (selection: GroupSelection) => set({ group: selection }),
    setTeacherFull: (selection: TeacherSelection) =>
      set({ teacher: selection }),
    setAudienceFull: (selection: AudienceSelection) =>
      set({ audience: selection }),

    confirm: () => {
      const { active, group, teacher, audience } = get()
      if (active === "group" && group.group) {
        set({
          confirmed: { type: "group", id: group.group },
        })
      } else if (active === "teacher" && teacher.teacher) {
        set({
          confirmed: { type: "teacher", id: teacher.teacher },
        })
      } else if (active === "audience" && audience.audience) {
        set({
          confirmed: { type: "audience", id: audience.audience },
        })
      }
    },
  })
)

export type { ScheduleTarget }
