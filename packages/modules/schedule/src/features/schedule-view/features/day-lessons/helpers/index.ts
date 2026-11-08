export function newScheduleRouteWithoutQueries({
  type,
  id,
  view,
}: {
  type: "group" | "teacher" | "audience"
  id: string
  view: "day" | "session"
}) {
  let url = ""
  switch (type) {
    case "group":
      url = `/schedule/${type}/${id}/${view}`

      break
    case "teacher":
      url = `/schedule/${type}/${id}/${view}`
      break
    case "audience":
      url = `/schedule/${type}/${id}/${view}`
      break
    default:
      url = `/schedule`
      break
  }
  return url
}
export function newScheduleRoute({
  type,
  id,
  view,
  data,
}: {
  type: "group" | "teacher" | "audience"
  id: string
  view: "day" | "session"
  data: {
    faculty?: string
    flow?: string
    department?: string
    building?: string
    floor?: string
  }
}) {
  let url = ""
  switch (type) {
    case "group":
      url = `/schedule/${type}/${id}/${view}?f=${data && data.faculty}&y=${data && data.flow}`

      break
    case "teacher":
      url = `/schedule/${type}/${id}/${view}?f=${data && data.faculty}&d=${data && data.department}`
      break
    case "audience":
      url = `/schedule/${type}/${id}/${view}?b=${data && data.building}&s=${data && data.floor}`
      break
    default:
      url = `/schedule`
      break
  }
  return url
}
export function newScheduleRouteQueries({
  type,
  data,
}: {
  type: "group" | "teacher" | "audience"
  id: string
  data: {
    faculty?: string
    flow?: string
    department?: string
    building?: string
    floor?: string
  }
}) {
  let queries = ""
  switch (type) {
    case "group":
      queries = `?f=${data && data.faculty}&y=${data && data.flow}`

      break
    case "teacher":
      queries = `?f=${data && data.faculty}&d=${data && data.department}`
      break
    case "audience":
      queries = `?b=${data && data.building}&s=${data && data.floor}`
      break
    default:
      queries = ""
      break
  }
  return queries
}
