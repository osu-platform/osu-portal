import { useScheduleSelectStore } from "./store"
import {
  useFacultiesQuery,
  useFlowsQuery,
  useGroupsQuery,
  useDepartmentsQuery,
  useTeachersQuery,
  useBuildingsQuery,
  useFloorsQuery,
  useAudiencesQuery,
} from "../../features/day-lessons/api/queries"
import type { ScheduleSelectionOptions } from "../../features/day-lessons/types/ui"

function toOptions(list: any[], labelKey: string, valueKey: string) {
  if (!Array.isArray(list)) return []
  return list.map((item) => ({ label: item[labelKey], value: item[valueKey] }))
}

export function useScheduleSelectOptions(): Partial<ScheduleSelectionOptions> {
  const { group, teacher, audience } = useScheduleSelectStore()

  const { data: facultiesData } = useFacultiesQuery()
  const { data: flowsData } = useFlowsQuery(group.faculty ?? null)
  const { data: groupsData } = useGroupsQuery(
    group.faculty ?? null,
    group.flow ?? null
  )
  const { data: departmentsData } = useDepartmentsQuery(teacher.faculty ?? null)
  const { data: teachersData } = useTeachersQuery(teacher.department ?? null)
  const { data: buildingsData } = useBuildingsQuery()
  const { data: floorsData } = useFloorsQuery(audience.building ?? null)
  const { data: audiencesData } = useAudiencesQuery(
    audience.building ?? null,
    audience.floor ?? null
  )

  return {
    faculties: toOptions((facultiesData as any)?.list ?? [], "name", "id"),
    flows: toOptions((flowsData as any)?.list ?? [], "name", "id"),
    groups: toOptions((groupsData as any)?.list ?? [], "name", "id"),
    departments: toOptions((departmentsData as any)?.list ?? [], "name", "id"),
    teachers: toOptions((teachersData as any)?.list ?? [], "title", "id"),
    buildings: toOptions((buildingsData as any)?.list ?? [], "name", "id"),
    floors: toOptions((floorsData as any)?.list ?? [], "name", "id"),
    audiences: toOptions((audiencesData as any)?.list ?? [], "name", "id"),
  }
}
