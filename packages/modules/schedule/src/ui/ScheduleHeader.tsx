import { IconButton, Title } from "@portal/shared-ui"
import { Burger, Search } from "@portal/shared-assets"
import styles from "./ScheduleHeader.module.css"
import { useOnboardingStep, controller } from "../features/schedule-onboarding/lib"

type ScheduleHeaderProps = {
  title: string
  onSearch?: () => void
  onMenu?: () => void
  menuRef?: React.Ref<HTMLElement>
}

export const ScheduleHeader = ({
  title,
  onSearch,
  onMenu,
  menuRef,
}: ScheduleHeaderProps) => {
  const { ref: searchRef } = useOnboardingStep("searchSchedule")
  const { ref: menuOnboardingRef, pass: passMenu } = useOnboardingStep("openMenu")

  const setMenuRef = (node: HTMLButtonElement | null) => {
    menuOnboardingRef(node)
    if (!menuRef) return
    if (typeof menuRef === "function") {
      menuRef(node)
    } else {
      ;(menuRef as React.MutableRefObject<HTMLElement | null>).current = node
    }
  }

  return (
  <div className={styles.wrapper}>
    <IconButton
      size="m"
      mode="gray"
      onClick={() => { controller.closeHint(); onSearch?.() }}
      aria-label="Поиск"
      ref={searchRef as unknown as React.Ref<HTMLButtonElement>}
    >
      <Search />
    </IconButton>
    <Title level="2" weight="2" className={styles.title}>
      {title}
    </Title>
    <IconButton
      size="m"
      mode="gray"
      onClick={() => { void passMenu(); onMenu?.() }}
      aria-label="Меню"
      ref={setMenuRef}
    >
      <Burger />
    </IconButton>
  </div>
  )
}
