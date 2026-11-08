import { useEffect, useMemo, useState } from "react"
import dayjs from "dayjs"
import "dayjs/locale/ru"
import { Timeline, Placeholder, Button, TimelineItem} from "@portal/shared-ui"
import { useTests } from "../hooks/useTests"
import { useExamStatus } from "../hooks/useExamStatus"
import {
  useSubgroupFilter,
  extractSubjectsWithSubgroups,
} from "../hooks/useSubgroupFilter"
import { groupExams } from "../model/groupExams"
import type { ExamGroup } from "../model/groupExams"
import { ExamStatusModal } from "../ui/ExamStatusModal"
import { SubgroupFilterModal } from "../ui/SubgroupFilterModal"
import { ExamsSkeleton } from "./ExamsSkeleton"
import { ScheduleSelect } from "../../../ui/select/ScheduleSelect"
import useViewSharedDataStore from "../../../hooks/useViewTitle/store"
import styles from "./Exams.module.css"

export const Exams = ({
  setViewTitle,
}: {
  setViewTitle: (value: string) => void
}) => {
  const { isLoading, data, confirmed } = useTests()
  const groupId = confirmed.type === "group" ? (confirmed.id ?? "") : ""
  const { getStatus, setStatus } = useExamStatus(groupId)
  const { hidden, toggle, isVisible } = useSubgroupFilter(groupId)

  const [selectedGroup, setSelectedGroup] = useState<ExamGroup | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectOpen, setSelectOpen] = useState(false)

  const setOnSearch = useViewSharedDataStore((state: any) => state.setOnSearch)

  setViewTitle("Расписание сессии")

  useEffect(() => {
    setOnSearch(() => {
      setSelectOpen(true)
    })
  }, [])

  const subjectsWithSubgroups = useMemo(
    () => extractSubjectsWithSubgroups(data),
    [data]
  )

  const grouped = useMemo(
    () => groupExams(data.filter(isVisible)),
    [data, isVisible]
  )

  // Статус группы: если хотя бы одна пара сдана/не сдана — показываем
  const getGroupStatus = (group: ExamGroup) => {
    for (const pair of group.pairs) {
      const s = getStatus(
        pair.subject.code,
        pair.realDay,
        pair.group.subgroupNum
      )
      if (s) return s
    }
    return null
  }

  if (confirmed.type !== "group") {
    return (
      <>
        <Placeholder
          header="Выберите расписание группы"
          description="Расписание сессии доступно только для групп"
          action={<Button onClick={() => setSelectOpen(true)}>Выбрать группу</Button>}
        />
        <ScheduleSelect
          open={selectOpen}
          onOpenChange={setSelectOpen}
          favorites={[]}
          setTitle={setViewTitle}
          view="session"
        />
      </>
    )
  }

  return (
    <div>
      {isLoading ? (
        <ExamsSkeleton />
      ) : (
        <>
          {subjectsWithSubgroups.length > 0 && (
            <div className={styles.filterRow}>
              <button
                className={styles.filterButton}
                onClick={() => setFilterOpen(true)}
              >
                Подгруппы
                {hidden.size > 0 && (
                  <span className={styles.filterBadge}>{hidden.size}</span>
                )}
              </button>
            </div>
          )}

          <Timeline active={2}>
            {grouped.map((group) => {
              const status = getGroupStatus(group)
              const { item, pairLabel, timeLabel } = group

              const itemClass =
                status === "passed"
                  ? styles.timelineItemPassed
                  : status === "failed"
                    ? styles.timelineItemFailed
                    : styles.timelineItem

              return (
                <TimelineItem
                  className={itemClass}
                  key={group.key}
                  mode={status ? "active" : undefined}
                  header={item.subject.name}
                  onClick={() => {
                    setSelectedGroup(group)
                    setModalOpen(true)
                  }}
                >
                  <div>
                    {item.realDay
                      ? dayjs(item.realDay).locale("ru").format("D MMMM")
                      : null}
                    {item.type.shortName && (
                      <span className={styles.subgroupLabel}>
                        {" · "}
                        {item.type.shortName}
                      </span>
                    )}
                    {timeLabel && (
                      <span className={styles.subgroupLabel}>
                        {" · "}
                        {timeLabel}
                      </span>
                    )}
                    {pairLabel && (
                      <span className={styles.subgroupLabel}>
                        {" · "}
                        {pairLabel}
                      </span>
                    )}
                    {item.group.subgroupAbbr && (
                      <span className={styles.subgroupLabel}>
                        {" · "}
                        {item.group.subgroupAbbr}
                      </span>
                    )}
                  </div>
                </TimelineItem>
              )
            })}
          </Timeline>
        </>
      )}

      <ExamStatusModal
        examGroup={selectedGroup}
        open={modalOpen}
        onOpenChange={setModalOpen}
        currentStatus={selectedGroup ? getGroupStatus(selectedGroup) : null}
        onSetStatus={(status) => {
          if (!selectedGroup) return
          // Сохраняем статус для каждой пары в группе отдельно
          for (const pair of selectedGroup.pairs) {
            setStatus(
              pair.subject.code,
              pair.realDay,
              pair.group.subgroupNum,
              status
            )
          }
        }}
      />

      <SubgroupFilterModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        subjects={subjectsWithSubgroups}
        hidden={hidden}
        onToggle={toggle}
      />

      <ScheduleSelect
        open={selectOpen}
        onOpenChange={setSelectOpen}
        favorites={[]}
        setTitle={setViewTitle}
        view="session"
      />
    </div>
  )
}
