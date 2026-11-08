import { Badge, ButtonCell, Popper } from "@portal/shared-ui"
import { useRef, useState } from "react"
import { useClickOutside } from "@portal/shared-ui/hooks"
import {
  Calendar,
  HandWrite,
  Heart,
  HeartFill,
  LightBulb,
  QR,
  Quit,
  Ring,
} from "@portal/shared-assets"
import { AboutModal } from "./AboutModal"
import { useOnboardingStep, onboardingHintRef } from "../features/schedule-onboarding/lib"
import type {
  FavoriteItem,
  ScheduleMode,
} from "../features/schedule-view/features/day-lessons/types/ui"
import styles from "./ScheduleMenu.module.css"
import { SubscriptionModal } from "../features/schedule-subscribe/ui/SubscriptionModal"
import { ScheduleTarget } from "../features/schedule-view/hooks/useSelectOptions/store"
import AddToCalendarModal from "../features/schedule-view/features/day-lessons/ui/export/AddToCalendarModal"

type ScheduleMenuProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ScheduleMode
  onModeChange: (mode: ScheduleMode) => void
  favorites: FavoriteItem[]
  isFavorite: boolean
  onToggleFavorite?: () => void
  onShare?: () => void
  onOpenSite?: () => void
  menuRef: React.RefObject<HTMLElement>
  scheduleStatus: ScheduleTarget
  scheduleTitle?: string
}

const CurrentModeBadge = () => <Badge type="dot" />

export const ScheduleMenu = ({
  open,
  onOpenChange,
  mode,
  onModeChange,
  isFavorite,
  onToggleFavorite,
  onShare,
  onOpenSite,
  menuRef,
  scheduleStatus,
  scheduleTitle,
}: ScheduleMenuProps) => {
  const targetRef = menuRef
  const { ref: watchRef, pass: passWatch } = useOnboardingStep("watchSchedule")
  const [openExportModal, setOpenExportModal] = useState<boolean>(false)
  const [openSubscriptionModal, setOpenSubscriptionModal] =
    useState<boolean>(false)
  const [openAboutModal, setOpenAboutModal] = useState<boolean>(false)
  const popperRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useClickOutside(
    () => {
      if (open) onOpenChange(false)
    },
    popperRef,
    menuRef,
    onboardingHintRef
  )

  return (
    <div className={styles.wrapper}>
      {open && (
        <Popper
          ref={popperRef}
          targetRef={targetRef}
          placement="bottom-end"
          className={styles.menu}
          offsetByMainAxis={8}
          onClick={() => onOpenChange(false)}
        >
          <ButtonCell
            before={<Calendar />}
            after={mode === "day" ? <CurrentModeBadge /> : undefined}
            onClick={() => onModeChange("day")}
          >
            Расписание
          </ButtonCell>
          <ButtonCell
            before={<HandWrite />}
            onClick={() => onModeChange("session")}
            after={mode === "session" ? <CurrentModeBadge /> : undefined}
          >
            Сессия
          </ButtonCell>

          <div className={styles.divider} />

          <ButtonCell
            before={<Ring />}
            ref={watchRef as unknown as React.Ref<HTMLElement>}
            onClick={() => {
              void passWatch()
              onOpenChange(false)
              setOpenSubscriptionModal(true)
            }}
            disabled={!scheduleStatus?.type}
          >
            Следить
          </ButtonCell>
          <ButtonCell before={<QR />} onClick={onShare} disabled>
            Поделиться
          </ButtonCell>
          <ButtonCell
            before={<Calendar />}
            onClick={() => setOpenExportModal(true)}
            disabled={!scheduleStatus?.type || !scheduleStatus.id}
          >
            Добавить в календарь
          </ButtonCell>
          <ButtonCell
            before={isFavorite ? <HeartFill /> : <Heart />}
            onClick={onToggleFavorite}
            disabled={!scheduleStatus?.type || !scheduleStatus.id}
          >
            {isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
          </ButtonCell>
          <ButtonCell before={<Quit />} onClick={onOpenSite}>
            На сайте ОГУ
          </ButtonCell>

          <div className={styles.divider} />

          <ButtonCell
            before={<LightBulb />}
            onClick={() => { onOpenChange(false); setOpenAboutModal(true) }}
          >
            О приложении
          </ButtonCell>
        </Popper>
      )}
      <AddToCalendarModal
        open={openExportModal}
        onOpenChange={setOpenExportModal}
        confirmed={scheduleStatus}
      />
      <SubscriptionModal
        open={openSubscriptionModal}
        onOpenChange={setOpenSubscriptionModal}
        confirmed={scheduleStatus}
        scheduleTitle={scheduleTitle}
      />
      <AboutModal open={openAboutModal} onOpenChange={setOpenAboutModal} />
    </div>
  )
}
