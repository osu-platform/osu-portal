import { useEffect, useState } from "react"
import { useScheduleView } from "../../../model/useScheduleView"

const useDates = () => {
  const { data, confirmed } = useScheduleView()
  const [dates, setDates] = useState<Array<string>>([])

  useEffect(() => {
    const newDates: { [key: string]: number } = {}

    data.map((item) => {
      if (newDates[item.realDay]) {
        newDates[item.realDay] = newDates[item.realDay] + 1
      } else {
        newDates[item.realDay] = 1
      }
    })

    const datesArray = Object.keys(newDates).sort()

    setDates(datesArray)
  }, [data, confirmed.id])

  return dates
}

export default useDates
