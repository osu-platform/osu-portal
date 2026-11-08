import { Badge, ButtonCell, Popper } from "@portal/shared-ui"
import { useState } from "react"
import {
  Calendar,
  HandWrite,
  Heart,
  HeartFill,
  QR,
  Quit,
  Ring,
} from "@portal/shared-assets"
import type { FavoriteItem, ScheduleMode } from "../../types/ui"
import styles from "./ScheduleMenu.module.css"
import AddToCalendarModal from "../export/AddToCalendarModal"
import { ScheduleTarget } from "../../../../hooks/useSelectOptions/store"

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
}: ScheduleMenuProps) => {
  const targetRef = menuRef
  const [openExportModal, setOpenExportModal] = useState<boolean>(false)

  return (
    <div className={styles.wrapper}>
      {open && (
        <Popper
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
            disabled
          >
            Сессия
          </ButtonCell>

          <div className={styles.divider} />

          <ButtonCell before={<Ring />} disabled>
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
            disabled
          >
            {isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
          </ButtonCell>
          <ButtonCell before={<Quit />} onClick={onOpenSite}>
            На сайте ОГУ
          </ButtonCell>
        </Popper>
      )}
      <AddToCalendarModal
        open={openExportModal}
        onOpenChange={setOpenExportModal}
        confirmed={scheduleStatus}
      />
    </div>
  )
}
