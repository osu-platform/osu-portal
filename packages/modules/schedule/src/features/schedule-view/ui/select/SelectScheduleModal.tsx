import {
  Button,
  Checkbox,
  Chip,
  Headline,
  Modal,
  Select,
  TabsList,
  Tappable,
} from "@portal/shared-ui"
import { useEffect, useState } from "react"
import type {
  FavoriteItem,
  ScheduleOwnerType,
  ScheduleSelectionOptions,
} from "../../features/day-lessons/types/ui"
import type { ScheduleTarget } from "../../hooks/useSelectOptions/store"
import styles from "./SelectScheduleModal.module.css"
import { newScheduleRouteQueries } from "../../features/day-lessons/helpers"
import { useSchedulePreferences } from "../../hooks/useSchedulePreferences"

type GroupSelection = { faculty?: string; flow?: string; group?: string }
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

type SelectScheduleModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  favorites: FavoriteItem[]
  onFavoriteClick?: (item: FavoriteItem) => void
  options?: Partial<ScheduleSelectionOptions>
  view?: "day" | "session"
  confirmed?: ScheduleTarget
  confirmedTitle?: string

  active: ScheduleOwnerType
  onActiveChange: (tab: ScheduleOwnerType) => void

  group: GroupSelection
  onGroupChange: (patch: Partial<GroupSelection>) => void

  teacher: TeacherSelection
  onTeacherChange: (patch: Partial<TeacherSelection>) => void

  audience: AudienceSelection
  onAudienceChange: (patch: Partial<AudienceSelection>) => void

  onConfirm: () => void

  setScheduleTitle: (value: string) => void
}

const hasOptions = (items?: { label: string; value: string }[]) =>
  Boolean(items && items.length > 0)

const getEmptyText = (items?: { label: string; value: string }[]) => {
  if (!items) return "Загрузка..."
  if (items.length === 0) return "Нет вариантов"
  return undefined
}

const getSelectedOption = (
  items: { label: string; value: string }[] | undefined,
  value?: string
) => items?.find((item) => item.value === value) ?? null

export const SelectScheduleModal = ({
  open,
  onOpenChange,
  favorites,
  onFavoriteClick,
  options,
  view = "day",
  active,
  onActiveChange,
  group,
  onGroupChange,
  teacher,
  onTeacherChange,
  audience,
  onAudienceChange,
  onConfirm,
  setScheduleTitle,
  confirmedTitle,
}: SelectScheduleModalProps) => {
  const [isDefault, setIsDefault] = useState<boolean>(false)

  const { defaultSchedule, setDefault, clearDefault } = useSchedulePreferences()

  const currentId =
    active === "group"
      ? group.group
      : active === "teacher"
        ? teacher.teacher
        : audience.audience

  // Sync checkbox with stored default
  useEffect(() => {
    if (defaultSchedule && currentId) {
      setIsDefault(
        defaultSchedule.type === active && defaultSchedule.id === currentId
      )
    } else if (!defaultSchedule) {
      // Fall back to localStorage for the check
      const raw = localStorage.getItem("default-schedule")
      if (raw && currentId) {
        try {
          const data = JSON.parse(raw)
          setIsDefault(data.id === currentId && data.type === active)
        } catch {
          setIsDefault(false)
        }
      } else {
        setIsDefault(false)
      }
    }
  }, [active, group.group, teacher.teacher, audience.audience, defaultSchedule])

  return (
    <Modal open={open} onOpenChange={onOpenChange} header={<Modal.Header />}>
    <div className={styles.wrapper}>
      {view === "session" && (
        <Headline weight="2" className={styles.sessionTitle}>Выберите группу</Headline>
      )}
      {favorites.length > 0 && (
        <div className={styles.favorites}>
          <Headline weight="2">Избранные</Headline>
          <div className={styles.favoritesList}>
            {favorites.map((item) => (
              <Chip
                key={`${item.type}-${item.id}`}
                onClick={() => onFavoriteClick?.(item)}
              >
                {item.title}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {view !== "session" && (
        <>
          <TabsList>
            <TabsList.Item
              selected={active === "group"}
              onClick={() => onActiveChange("group")}
            >
              Группа
            </TabsList.Item>
            <TabsList.Item
              selected={active === "teacher"}
              onClick={() => onActiveChange("teacher")}
            >
              Преподаватель
            </TabsList.Item>
            <TabsList.Item
              selected={active === "audience"}
              onClick={() => onActiveChange("audience")}
            >
              Аудитория
            </TabsList.Item>
          </TabsList>
          <div className={styles.divider}></div>
        </>
      )}

      <div className={styles.form}>
          {active === "group" && (
            <>
              <Select
                header="Факультет"
                value={getSelectedOption(options?.faculties, group.faculty)}
                options={options?.faculties}
                searchable={false}
                emptyText={getEmptyText(options?.faculties)}
                disabled={!hasOptions(options?.faculties)}
                onChange={(option) =>
                  onGroupChange({ faculty: String(option?.value ?? "") })
                }
                placeholder="Выберите факультет"
              />

              {hasOptions(options?.faculties) && (
                <Select
                  header="Поток"
                  value={getSelectedOption(options?.flows, group.flow)}
                  options={options?.flows}
                  searchable={false}
                  emptyText={getEmptyText(options?.flows)}
                  disabled={!hasOptions(options?.flows)}
                  onChange={(option) =>
                    onGroupChange({ flow: String(option?.value ?? "") })
                  }
                  placeholder="Выберите поток"
                />
              )}

              {hasOptions(options?.groups) && (
                <Select
                  header="Группа"
                  value={getSelectedOption(options?.groups, group.group)}
                  options={options?.groups}
                  searchable={false}
                  emptyText={getEmptyText(options?.groups)}
                  disabled={!hasOptions(options?.groups)}
                  onChange={(option) => {
                    onGroupChange({ group: String(option?.value ?? "") })
                  }}
                  placeholder="Выберите группу"
                />
              )}
            </>
          )}

          {active === "teacher" && (
            <>
              <Select
                header="Факультет"
                value={getSelectedOption(options?.faculties, teacher.faculty)}
                options={options?.faculties}
                searchable={false}
                emptyText={getEmptyText(options?.faculties)}
                disabled={!hasOptions(options?.faculties)}
                onChange={(option) =>
                  onTeacherChange({ faculty: String(option?.value ?? "") })
                }
                placeholder="Выберите факультет"
              />

              {hasOptions(options?.faculties) && (
                <Select
                  header="Кафедра"
                  value={getSelectedOption(
                    options?.departments,
                    teacher.department
                  )}
                  options={options?.departments}
                  searchable={false}
                  emptyText={getEmptyText(options?.departments)}
                  disabled={!hasOptions(options?.departments)}
                  onChange={(option) =>
                    onTeacherChange({ department: String(option?.value ?? "") })
                  }
                  placeholder="Выберите кафедру"
                />
              )}

              {hasOptions(options?.departments) && (
                <Select
                  header="Преподаватель"
                  value={getSelectedOption(options?.teachers, teacher.teacher)}
                  options={options?.teachers}
                  searchable={false}
                  emptyText={getEmptyText(options?.teachers)}
                  disabled={!hasOptions(options?.teachers)}
                  onChange={(option) => {
                    onTeacherChange({ teacher: String(option?.value ?? "") })
                  }}
                  placeholder="Выберите преподавателя"
                />
              )}
            </>
          )}

          {active === "audience" && (
            <>
              <Select
                header="Корпус"
                value={getSelectedOption(options?.buildings, audience.building)}
                options={options?.buildings}
                searchable={false}
                emptyText={getEmptyText(options?.buildings)}
                disabled={!hasOptions(options?.buildings)}
                onChange={(option) =>
                  onAudienceChange({ building: String(option?.value ?? "") })
                }
                placeholder="Выберите корпус"
              />

              {hasOptions(options?.buildings) && (
                <Select
                  header="Этаж"
                  value={getSelectedOption(options?.floors, audience.floor)}
                  options={options?.floors}
                  searchable={false}
                  emptyText={getEmptyText(options?.floors)}
                  disabled={!hasOptions(options?.floors)}
                  onChange={(option) =>
                    onAudienceChange({ floor: String(option?.value ?? "") })
                  }
                  placeholder="Выберите этаж"
                />
              )}

              {hasOptions(options?.floors) && (
                <Select
                  header="Аудитория"
                  value={getSelectedOption(
                    options?.audiences,
                    audience.audience
                  )}
                  options={options?.audiences}
                  searchable={false}
                  emptyText={getEmptyText(options?.audiences)}
                  disabled={!hasOptions(options?.audiences)}
                  onChange={(option) => {
                    onAudienceChange({ audience: String(option?.value ?? "") })
                  }}
                  placeholder="Выберите аудиторию"
                />
              )}
            </>
          )}

          <div className={styles.actions}>
            <Button
              stretched
              size="l"
              onClick={() => {
                const newTitle =
                  (active === "group"
                    ? getSelectedOption(options?.groups, group.group)?.label
                    : active === "teacher"
                      ? getSelectedOption(options?.teachers, teacher.teacher)?.label
                      : getSelectedOption(options?.audiences, audience.audience)?.label)
                  ?? confirmedTitle
                  ?? ""

                setScheduleTitle(newTitle)
                onConfirm()

                if (isDefault && currentId) {
                  const query = newScheduleRouteQueries({
                    type: active,
                    id: currentId,
                    data: {
                      faculty: group.faculty,
                      flow: group.flow,
                      department: teacher.department,
                      building: audience.building,
                      floor: audience.floor,
                    },
                  })
                  setDefault({
                    type: active,
                    id: currentId,
                    name: newTitle || currentId,
                    view: "day",
                    query,
                  })
                } else if (!isDefault && defaultSchedule?.id === currentId && defaultSchedule?.type === active) {
                  clearDefault()
                }
              }}
              disabled={
                !(active === "audience" && audience.audience) &&
                !(active === "teacher" && teacher.teacher) &&
                !(active === "group" && group.group)
              }
            >
              Показать
            </Button>
            {((active === "audience" && audience.audience) ||
              (active === "teacher" && teacher.teacher) ||
              (active === "group" && group.group)) && (
              <Tappable
                Component="label"
                interactiveAnimation="opacity"
                className={styles.defaultOption}
              >
                <Checkbox
                  name="checkbox"
                  checked={isDefault}
                  onChange={(e) => {
                    setIsDefault(Boolean(e.target.checked))
                  }}
                />
                Установить по умолчанию
              </Tappable>
            )}
          </div>
        </div>
    </div>
    </Modal>
  )
}
