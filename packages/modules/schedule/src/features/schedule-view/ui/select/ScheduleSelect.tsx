import { SelectScheduleModal } from "./SelectScheduleModal"
import { controller } from "../../../schedule-onboarding/lib"
import { useScheduleSelectStore } from "../../hooks/useSelectOptions/store"
import { useScheduleSelectOptions } from "../../hooks/useSelectOptions"
import type { FavoriteItem } from "../../features/day-lessons/types/ui"
import { newScheduleRoute, newScheduleRouteWithoutQueries } from "../../features/day-lessons/helpers"
import { useNavigate } from "react-router-dom"
import { useSchedulePreferences } from "../../hooks/useSchedulePreferences"
import useViewSharedDataStore from "../../hooks/useViewTitle/store"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  favorites?: FavoriteItem[]
  setTitle: (value: string) => void
  view?: "day" | "session"
}

export const ScheduleSelect = ({
  open,
  onOpenChange,
  favorites: favoritesProp,
  setTitle,
  view = "day",
}: Props) => {
  const {
    active,
    group,
    teacher,
    audience,
    confirmed,
    setActive,
    setGroup,
    setTeacher,
    setAudience,
    setScheduleTitle: storeSetScheduleTitle,
    confirm,
  } = useScheduleSelectStore()
  const viewTitle = useViewSharedDataStore((s) => s.viewTitle)
  const options = useScheduleSelectOptions()
  const navigate = useNavigate()
  const { favorites: storedFavorites } = useSchedulePreferences()

  // Prefer favorites from hook (backend), fall back to prop
  const favorites = storedFavorites.length > 0 ? storedFavorites : (favoritesProp ?? [])

  const handleSetTitle = (title: string) => {
    setTitle(title)
    storeSetScheduleTitle(title)
  }

  const handleModalClose = (open: boolean) => {
    if (!open) void controller.passStep("searchSchedule")
    onOpenChange(open)
  }

  const handleConfirm = () => {
    confirm()
    const type =
      active === "group"
        ? "group"
        : active === "teacher"
          ? "teacher"
          : "audience"
    const id =
      type === "group"
        ? (group.group as string)
        : type === "teacher"
          ? (teacher.teacher as string)
          : (audience.audience as string)
    const data =
      type === "group" ? group : type === "teacher" ? teacher : audience

    const url = newScheduleRoute({ type: active, view, id, data })

    navigate(url)

    onOpenChange(false)
  }

  const handleFavoriteClick = (item: FavoriteItem) => {
    const url = newScheduleRouteWithoutQueries({
      type: item.type,
      id: item.id,
      view,
    })
    navigate(url)
    onOpenChange(false)
  }

  return (
    <SelectScheduleModal
      open={open}
      onOpenChange={handleModalClose}
      favorites={favorites}
      onFavoriteClick={handleFavoriteClick}
      options={options}
      active={active}
      onActiveChange={setActive}
      group={group}
      onGroupChange={setGroup}
      teacher={teacher}
      onTeacherChange={setTeacher}
      audience={audience}
      onAudienceChange={setAudience}
      onConfirm={handleConfirm}
      setScheduleTitle={handleSetTitle}
      view={view}
      confirmed={confirmed}
      confirmedTitle={viewTitle}
    />
  )
}
