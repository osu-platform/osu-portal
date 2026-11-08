import { useQuery } from "@tanstack/react-query"
import { lessonApiClient } from "./lessonApi"
import { LessonMapper } from "../model/mapper"

export const lessonKeys = {
  all: ["lesson"] as const,
  byGroup: (group: string) => [...lessonKeys.all, "group", group] as const,
  byTeacher: (teacher: string) =>
    [...lessonKeys.all, "teacher", teacher] as const,
  byAudience: (audience: string) =>
    [...lessonKeys.all, "audience", audience] as const,
  classes: (group: string) => [...lessonKeys.all, "classes", group] as const,
  faculties: () => [...lessonKeys.all, "faculties"] as const,
  flows: (facult: string) => [...lessonKeys.all, "flows", facult] as const,
  groups: (facult: string, flow: string) =>
    [...lessonKeys.all, "groups", facult, flow] as const,
  teachers: (department: string) =>
    [...lessonKeys.all, "teachers", department] as const,
  departments: (faculty: string) =>
    [...lessonKeys.all, "departments", faculty] as const,
  buildings: () => [...lessonKeys.all, "buildings"] as const,
  floors: (building: string) =>
    [...lessonKeys.all, "floors", building] as const,
  audiences: (building: string, floor: string) =>
    [...lessonKeys.all, "audiences", building, floor] as const,
}

export function useLessonsByGroupQuery(group: string | null) {
  return useQuery({
    queryKey: lessonKeys.byGroup(group ?? ""),
    queryFn: async ({ signal }) => {
      const entries = await lessonApiClient.getByGroup(group!, signal)
      if (!entries) return []
      return LessonMapper.fromEntries(entries)
    },
    enabled: !!group,
  })
}

export function useClassesQuery(group: string | null) {
  return useQuery({
    queryKey: lessonKeys.classes(group ?? ""),
    queryFn: async ({ signal }) => lessonApiClient.getClasses(group!, signal),
    enabled: !!group,
  })
}

export function useLessonsByTeacherQuery(teacher: string | null) {
  return useQuery({
    queryKey: lessonKeys.byTeacher(teacher ?? ""),
    queryFn: async ({ signal }) =>
      lessonApiClient.getByTeacher(teacher!, signal),
    enabled: !!teacher,
  })
}

export function useLessonsByAudienceQuery(audience: string | null) {
  return useQuery({
    queryKey: lessonKeys.byAudience(audience ?? ""),
    queryFn: async ({ signal }) =>
      lessonApiClient.getByAudience(audience!, signal),
    enabled: !!audience,
  })
}

export function useFacultiesQuery() {
  return useQuery({
    queryKey: lessonKeys.faculties(),
    queryFn: () => lessonApiClient.getFaculties(),
    staleTime: Infinity, // факультеты не меняются
  })
}

export function useFlowsQuery(facult: string | null) {
  return useQuery({
    queryKey: lessonKeys.flows(facult ?? ""),
    queryFn: () => lessonApiClient.getFlows(facult!),
    enabled: !!facult,
    staleTime: Infinity,
  })
}

export function useGroupsQuery(facult: string | null, flow: string | null) {
  return useQuery({
    queryKey: lessonKeys.groups(facult ?? "", flow ?? ""),
    queryFn: () => lessonApiClient.getGroups(facult!, flow!),
    enabled: !!facult && !!flow,
    staleTime: Infinity,
  })
}

export function useTeachersQuery(department: string | null) {
  return useQuery({
    queryKey: lessonKeys.teachers(department ?? ""),
    queryFn: () => lessonApiClient.getTeachers(department!),
    enabled: !!department,
    staleTime: Infinity,
  })
}

export function useDepartmentsQuery(faculty: string | null) {
  return useQuery({
    queryKey: lessonKeys.departments(faculty ?? ""),
    queryFn: () => lessonApiClient.getDepartments(faculty!),
    enabled: !!faculty,
    staleTime: Infinity,
  })
}

export function useBuildingsQuery() {
  return useQuery({
    queryKey: lessonKeys.buildings(),
    queryFn: () => lessonApiClient.getBuildings(),
    staleTime: Infinity,
  })
}

export function useFloorsQuery(building: string | null) {
  return useQuery({
    queryKey: lessonKeys.floors(building ?? ""),
    queryFn: () => lessonApiClient.getFloors(building!),
    enabled: !!building,
    staleTime: Infinity,
  })
}

export function useAudiencesQuery(
  building: string | null,
  floor: string | null
) {
  return useQuery({
    queryKey: lessonKeys.audiences(building ?? "", floor ?? ""),
    queryFn: () => lessonApiClient.getAudiences(building!, floor!),
    enabled: !!building && !!floor,
    staleTime: Infinity,
  })
}
