// import { useQueryState } from "nuqs"
import { useEffect, useState } from "react"
import {
  useAudiencesQuery,
  useBuildingsQuery,
  useDepartmentsQuery,
  useFacultiesQuery,
  useFloorsQuery,
  useFlowsQuery,
  useGroupsQuery,
  useTeachersQuery,
} from "../api/queries"
import { useScheduleSelectStore } from "../../../hooks/useSelectOptions/store"

export const useGetTitle = (
  type: "group" | "teacher" | "audience",
  id: string
) => {
  const getParam = (key: string) =>
    new URLSearchParams(window.location.search).get(key)
  const [title, setTitle] = useState<string>("")

  // const [faculty] = useQueryState("f")
  // const [flow] = useQueryState("y")
  // const [department] = useQueryState("d")
  // const [building] = useQueryState("b")
  // const [floor] = useQueryState("s")
  const faculty = getParam("f")
  const flow = getParam("y")
  const department = getParam("d")
  const building = getParam("b")
  const floor = getParam("s")

  const { setGroupFull, setTeacherFull, setAudienceFull, setActive, confirm } =
    useScheduleSelectStore()

  useFacultiesQuery()
  useBuildingsQuery()
  useFloorsQuery(faculty)
  useDepartmentsQuery(faculty)
  useFlowsQuery(faculty)

  const { data: groupsData } = useGroupsQuery(faculty, flow)
  const { data: teachersData } = useTeachersQuery(department)
  const { data: audiencesData } = useAudiencesQuery(building, floor)

  useEffect(() => {
    setTitle("")
  }, [type, id])

  useEffect(() => {
    switch (type) {
      case "group": {
        if (!groupsData || !faculty || !flow) return
        const found = (groupsData as any).list?.find((g: any) => g.id === id)
        if (!found) return
        setTitle(found.name)
        setActive("group")
        setGroupFull({ faculty, flow, group: id })
        confirm()
        break
      }
      case "teacher": {
        if (!teachersData || !faculty || !department) return
        const found = (teachersData as any).list?.find((t: any) => t.id === id)
        if (!found) return
        setTitle(found.title)
        setActive("teacher")
        setTeacherFull({ faculty, department, teacher: id })
        confirm()
        break
      }
      case "audience": {
        if (!audiencesData || !building || !floor) return
        const found = (audiencesData as any).list?.find((a: any) => a.id === id)
        if (!found) return
        setTitle(found.name)
        setActive("audience")
        setAudienceFull({ building, floor, audience: id })
        confirm()
        break
      }
    }
  }, [
    faculty,
    flow,
    department,
    building,
    floor,
    type,
    id,
    groupsData,
    teachersData,
    audiencesData,
  ])

  return title
}
