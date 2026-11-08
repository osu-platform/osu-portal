import { getSdk } from "@portal/module-sdk"
import { useEffect, useMemo, useState } from "react"
import { ViewSharedDataStore } from "../../../hooks/useViewTitle/types"
import { DayTabs } from "../ui/view/DayTabs"
import { DateControls } from "../ui/view/DateControls"
import { SwipeableScheduleList } from "../ui/view/SwipeableScheduleList"
import { ClassDetailsModal } from "../ui/view/ClassDetailsModal"
import { LessonEntity } from "../model/schemas"
import dayjs from "dayjs"
import styles from "./Day.module.css"
import { ScheduleSelect } from "../../../ui/select/ScheduleSelect"
import useViewSharedDataStore from "../../../hooks/useViewTitle/store"
import { TODAY, TOMORROW } from "../helpers/constants"
import { ScheduleTarget } from "../../../hooks/useSelectOptions/store"
import { useParams } from "react-router-dom"
import { useGetTitle } from "../hooks/useGetTitle"
import { useQueryState } from "nuqs"
import useDates from "../hooks/useDates"
import useLessons from "../hooks/useLessons"

export function genRange(dates: string[]): string[] {
  if (!dates || dates.length === 0) {
    return []
  }
  const start = dates[0]
  const end = dates[dates.length - 1]
  let curr = start
  const range: string[] = [start]
  while (curr <= end) {
    curr = dayjs(curr).add(1, "day").format("YYYY-MM-DD")
    range.push(curr)
  }
  return range
}

export function buildScheduleUrl(target: ScheduleTarget): string {
  const base = getSdk().config.scheduleSiteUrl

  switch (target?.type) {
    case "group":
      return `${base}?who=1&what=1&filial=1&group=${target?.id}&mode=full`
    case "teacher":
      return `${base}?request=rasp&prep=${target?.id}&who=2`
    case "audience":
      return `${base}?request=rasp&aud=${target?.id}&who=3`
    default:
      return ""
  }
}

const Day = ({
  setViewTitle,
}: {
  setViewTitle: ViewSharedDataStore["setViewTitle"]
}) => {
  const [date, setDate] = useQueryState("date")
  const [otherDate, setOtherDate] = useState(TODAY)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<LessonEntity | null>(null)
  const [selectOpen, setSelectOpen] = useState(false)
  const lessons = useLessons()
  const datesLessons = useDates()
  const dates = useMemo(() => genRange(datesLessons), [datesLessons])

  const setOnSearch = useViewSharedDataStore((state) => state.setOnSearch)

  const { type, id } = useParams()

  const title = useGetTitle(
    type as "group" | "teacher" | "audience",
    id as string
  )

  useEffect(() => {
    setViewTitle(title)
  }, [title, type, id])

  useEffect(() => {
    setOnSearch(() => {
      setSelectOpen(true)
    })
  }, [])

  const panelIndex = dates.find((item) => item === otherDate)

  const handleDayChange = (next: string) => {
    setOtherDate(next)
  }

  const handlePanelIndexChange = (index: string) => {
    setOtherDate(index)
  }

  const handleSelect = (item: LessonEntity) => {
    setSelectedItem(item)
    setDetailsOpen(true)
  }

  const panels = useMemo(
    () => [
      dayjs(otherDate).subtract(1, "day").format("YYYY-MM-DD"),
      otherDate,
      dayjs(otherDate).add(1, "day").format("YYYY-MM-DD"),
    ],
    [dates, lessons, otherDate]
  )

  useEffect(() => {
    setOtherDate(date || TODAY)
  }, [date])

  return (
    <div>
      <div className={styles.controls}>
        <DayTabs value={otherDate} onChange={handleDayChange} />
        {otherDate !== TODAY && otherDate !== TOMORROW && (
          <DateControls
            value={otherDate}
            onChange={setOtherDate}
            onPrev={() => {
              setOtherDate(
                dayjs(otherDate).subtract(1, "day").format("YYYY-MM-DD")
              )
              setDate(dayjs(otherDate).subtract(1, "day").format("YYYY-MM-DD"))
            }}
            onNext={() => {
              setOtherDate(dayjs(otherDate).add(1, "day").format("YYYY-MM-DD"))
              setDate(dayjs(otherDate).add(1, "day").format("YYYY-MM-DD"))
            }}
          />
        )}
      </div>

      <SwipeableScheduleList
        index={panelIndex as string}
        onIndexChange={handlePanelIndexChange}
        panels={panels}
        handleSelect={handleSelect}
      />
      <ClassDetailsModal
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open)
          if (!open) setSelectedItem(null)
        }}
        item={selectedItem}
      />
      <ScheduleSelect
        open={selectOpen}
        onOpenChange={setSelectOpen}
        favorites={[]}
        setTitle={setViewTitle}
      />
    </div>
  )
}

export { Day }
