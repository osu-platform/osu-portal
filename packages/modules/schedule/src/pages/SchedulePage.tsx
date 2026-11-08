import { getSdk } from "@portal/module-sdk"
import { useEffect, useRef, useState } from "react"
import { ScheduleMenu } from "../ui/ScheduleMenu"
import type { ScheduleMode } from "../features/schedule-view/features/day-lessons/types/ui"
import styles from "./SchedulePage.module.css"
import { useScheduleSelectStore } from "../features/schedule-view/hooks/useSelectOptions/store"
import { View } from "../features/schedule-view"
import { ScheduleHeader } from "../ui/ScheduleHeader"
import { useViewTitle } from "../features/schedule-view"
import { useViewOnSerchAction } from "../features/schedule-view/hooks/useViewTitle"
import { useNavigate, useParams } from "react-router-dom"
import {
  newScheduleRouteWithoutQueries,
} from "../features/schedule-view/features/day-lessons/helpers"
import { useSchedulePreferences } from "../features/schedule-view/hooks/useSchedulePreferences"
import { ScheduleOnboardingHint } from "../features/schedule-onboarding/ScheduleOnboardingHint"
import { useScheduleOnboarding } from "../features/schedule-onboarding/useScheduleOnboarding"

type ScheduleTarget =
  | { type: "group"; id: string }
  | { type: "teacher"; id: string }
  | { type: "audience"; id: string }

export function buildScheduleUrl(target: ScheduleTarget): string {
  const base = getSdk().config.scheduleSiteUrl

  switch (target.type) {
    case "group":
      return `${base}?who=1&what=1&filial=1&group=${target.id}&mode=full`
    case "teacher":
      return `${base}?request=rasp&prep=${target.id}&who=2`
    case "audience":
      return `${base}?request=rasp&aud=${target.id}&who=3`
  }
}

export const SchedulePage = () => {
  const viewTitle = useViewTitle()
  const onSearch = useViewOnSerchAction()
  const [menuOpen, setMenuOpen] = useState(false)
  const { view } = useParams()
  const [mode, setMode] = useState<ScheduleMode>(
    view === "session" ? "session" : "day"
  )
  const { confirmed } = useScheduleSelectStore()
  const navigate = useNavigate()
  const { id, type } = useParams()

  const { isFavorite, toggleFavorite, load, loaded } = useSchedulePreferences()

  useScheduleOnboarding(Boolean(confirmed))

  useEffect(() => {
    if (!loaded) load()
  }, [])

  const currentIsFavorite =
    confirmed ? isFavorite(confirmed.type, confirmed.id) : false

  const handleToggleFavorite = () => {
    if (!confirmed) return
    toggleFavorite({
      type: confirmed.type,
      id: confirmed.id,
      name: viewTitle || confirmed.id,
    })
  }

  // Синхронизируем mode при прямом переходе по URL
  useEffect(() => {
    setMode(view === "session" ? "session" : "day")
  }, [view])

  const menuRef = useRef<HTMLElement>(null)

  function onModeChange(nextMode: ScheduleMode) {
    const newUrl = newScheduleRouteWithoutQueries({
      type: type as "group" | "teacher" | "audience",
      id: id as string,
      view: nextMode,
    })

    // Сохраняем текущие query-параметры при переключении
    navigate(newUrl + window.location.search)
  }

  return (
    <div className={styles.page}>
      <ScheduleHeader
        title={viewTitle || "Расписание"}
        onSearch={onSearch}
        menuRef={menuRef}
        onMenu={() => setMenuOpen((prev) => !prev)}
      />

      <ScheduleMenu
        scheduleStatus={confirmed}
        scheduleTitle={viewTitle || undefined}
        open={menuOpen}
        onOpenChange={setMenuOpen}
        mode={mode}
        onOpenSite={() => {
          if (!confirmed) return
          const url = buildScheduleUrl(confirmed)
          window.open(url, "_blank")
        }}
        onModeChange={onModeChange}
        favorites={[]}
        isFavorite={currentIsFavorite}
        onToggleFavorite={handleToggleFavorite}
        menuRef={menuRef as React.RefObject<HTMLElement>}
      />
      <View />
      <ScheduleOnboardingHint />
    </div>
  )
}
