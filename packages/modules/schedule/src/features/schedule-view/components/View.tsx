import { useParams, Navigate } from "react-router-dom"
import useViewTitleStore from "../hooks/useViewTitle/store"
import { Day } from "../features/day-lessons"
import { Exams } from "../features/exams"

const View = () => {
  const setViewTitle = useViewTitleStore((state) => state.setViewTitle)
  const { type, id, view } = useParams()

  // TODO move `if` to map with all types of view
  if (view === "day" && type && id) {
    return <Day setViewTitle={setViewTitle} />
  } else if (view === "session" && type && id) {
    return <Exams setViewTitle={setViewTitle} />
  }

  return <Navigate to="/schedule" />
}

export { View }
