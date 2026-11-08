import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  Button,
  Cell,
  IconButton,
  Input,
  List,
  Modal,
  Section,
  Switch,
  Text,
} from "@portal/shared-ui"
import { ScheduleTarget } from "../../schedule-view/hooks/useSelectOptions/store"
import {
  useSubscriptionsQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  subscriptionKeys,
} from "../model/queries"
import styles from "./SubscriptionModal.module.css"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  confirmed: ScheduleTarget
  scheduleTitle?: string
}

const DAILY_TIMES = ["06:30", "07:00", "07:30", "08:00", "08:30", "09:00"]
const BEFORE_MINUTES = [5, 10, 15, 20, 30, 60]

type AddStep = "type" | "daily_time" | "before_minutes"

const CloseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 2L14 14M14 2L2 14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

function isValidTime(val: string) {
  return /^\d{2}:\d{2}$/.test(val) && (() => {
    const [h, m] = val.split(":").map(Number)
    return h >= 0 && h <= 23 && m >= 0 && m <= 59
  })()
}

export const SubscriptionModal = ({
  open,
  onOpenChange,
  confirmed,
  scheduleTitle,
}: Props) => {
  const [addStep, setAddStep] = useState<AddStep | null>(null)
  const [conflictMsg, setConflictMsg] = useState<string | null>(null)
  const [customTime, setCustomTime] = useState("")
  const [customMinutes, setCustomMinutes] = useState("")
  const queryClient = useQueryClient()
  const { data: allSubs = [], isLoading } = useSubscriptionsQuery()
  const createMutation = useCreateSubscriptionMutation()
  const updateMutation = useUpdateSubscriptionMutation()
  const deleteMutation = useDeleteSubscriptionMutation()

  const targetName = scheduleTitle || confirmed?.id

  useEffect(() => {
    if (!open) {
      setAddStep(null)
      setConflictMsg(null)
      setCustomTime("")
      setCustomMinutes("")
    }
  }, [open])

  const createSub = async (
    params: { notification_type: "daily"; daily_time: string } | { notification_type: "before_lesson"; before_minutes: number }
  ) => {
    if (!confirmed) return
    try {
      await createMutation.mutateAsync({
        target_type: confirmed.type as "group" | "teacher",
        external_id: confirmed.id,
        target_name: targetName ?? confirmed.id,
        ...params,
      })
      setAddStep(null)
      setCustomTime("")
      setCustomMinutes("")
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("409")) {
        await queryClient.invalidateQueries({ queryKey: subscriptionKeys.all })
        setConflictMsg("Такое уведомление уже добавлено")
        setAddStep(null)
      } else {
        throw e
      }
    }
  }

  const handleDailyTime = (time: string) =>
    createSub({ notification_type: "daily", daily_time: time })

  const handleCustomTime = () => {
    if (isValidTime(customTime)) handleDailyTime(customTime)
  }

  const handleBeforeMinutes = (minutes: number) =>
    createSub({ notification_type: "before_lesson", before_minutes: minutes })

  const handleCustomMinutes = () => {
    const n = parseInt(customMinutes, 10)
    if (!isNaN(n) && n > 0 && n <= 1440) handleBeforeMinutes(n)
  }

  const handleToggle = (id: number, enabled: boolean) => {
    updateMutation.mutate({ id, params: { enabled } })
  }

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id)
  }

  const handleClose = (next: boolean) => {
    if (!next) setAddStep(null)
    onOpenChange(next)
  }

  const notifLabel = (s: (typeof allSubs)[0]) => {
    if (s.notification_type === "daily" && s.daily_time)
      return `Ежедневно в ${s.daily_time}`
    if (s.notification_type === "before_lesson" && s.before_minutes)
      return formatBeforeMinutes(s.before_minutes)
    return s.notification_type
  }

  const hasSubs = !isLoading && allSubs.length > 0
  const emptyEntry = !isLoading && allSubs.length === 0 && addStep === null
  const showTypeStep = addStep === "type" || emptyEntry
  const showList = hasSubs && addStep === null

  return (
    <Modal open={open} onOpenChange={handleClose} header={<Modal.Header />}>
      <div className={styles.container}>
        <div className={styles.titleRow}>
          <Text weight="2" className={styles.title}>
            Уведомления о расписании
          </Text>
        </div>

        {isLoading && addStep === null && (
          <div className={styles.loading}>
            <Text className={styles.hint}>Загрузка...</Text>
          </div>
        )}

        {showTypeStep && (
          <>
            {emptyEntry && (
              <Text className={styles.hint}>
                Уведомления будут приходить в чате после подписки.
              </Text>
            )}
            <List>
              <Section header="Выберите тип уведомления">
                <Cell
                  onClick={() => {
                    setConflictMsg(null)
                    setAddStep("daily_time")
                  }}
                  className={styles.optionCell}
                  subtitle="Сводка расписания на день"
                >
                  Ежедневная сводка утром
                </Cell>
                <Cell
                  onClick={() => {
                    setConflictMsg(null)
                    setAddStep("before_minutes")
                  }}
                  className={styles.optionCell}
                  subtitle="Напоминание перед каждой парой"
                >
                  За несколько минут до пары
                </Cell>
              </Section>
            </List>
            {!emptyEntry && (
              <div className={styles.footer}>
                <Button
                  mode="outline"
                  size="m"
                  stretched
                  onClick={() => setAddStep(null)}
                >
                  Назад
                </Button>
              </div>
            )}
          </>
        )}

        {addStep === "daily_time" && (
          <List>
            <Section header="В какое время присылать расписание?">
              {DAILY_TIMES.map((t) => (
                <Cell
                  key={t}
                  onClick={() => handleDailyTime(t)}
                  className={styles.optionCell}
                >
                  {t}
                </Cell>
              ))}
              <div className={styles.customInputRow}>
                <div className={styles.customInputWrapper}>
                  <Input
                    placeholder="Своё время (ЧЧ:ММ)"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCustomTime()}
                    status={customTime && !isValidTime(customTime) ? "error" : undefined}
                  />
                </div>
                <Button
                  size="m"
                  mode="outline"
                  onClick={handleCustomTime}
                  disabled={!isValidTime(customTime) || createMutation.isPending}
                >
                  Выбрать
                </Button>
              </div>
            </Section>
            <div className={styles.footer}>
              <Button
                mode="outline"
                size="m"
                stretched
                onClick={() => {
                  setCustomTime("")
                  setAddStep("type")
                }}
              >
                Назад
              </Button>
            </div>
          </List>
        )}

        {addStep === "before_minutes" && (
          <List>
            <Section header="За сколько минут до пары?">
              {BEFORE_MINUTES.map((m) => (
                <Cell
                  key={m}
                  onClick={() => handleBeforeMinutes(m)}
                  className={styles.optionCell}
                >
                  {formatBeforeMinutes(m)}
                </Cell>
              ))}
              <div className={styles.customInputRow}>
                <div className={styles.customInputWrapper}>
                  <Input
                    placeholder="Своё количество минут"
                    value={customMinutes}
                    type="number"
                    min={1}
                    max={1440}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCustomMinutes()}
                    status={
                      customMinutes &&
                      (isNaN(parseInt(customMinutes, 10)) ||
                        parseInt(customMinutes, 10) <= 0 ||
                        parseInt(customMinutes, 10) > 1440)
                        ? "error"
                        : undefined
                    }
                  />
                </div>
                <Button
                  size="m"
                  mode="outline"
                  onClick={handleCustomMinutes}
                  disabled={
                    !customMinutes ||
                    isNaN(parseInt(customMinutes, 10)) ||
                    parseInt(customMinutes, 10) <= 0 ||
                    parseInt(customMinutes, 10) > 1440 ||
                    createMutation.isPending
                  }
                >
                  Выбрать
                </Button>
              </div>
            </Section>
            <div className={styles.footer}>
              <Button
                mode="outline"
                size="m"
                stretched
                onClick={() => {
                  setCustomMinutes("")
                  setAddStep("type")
                }}
              >
                Назад
              </Button>
            </div>
          </List>
        )}

        {showList && (
          <>
            {conflictMsg && (
              <Text className={styles.conflictMsg}>{conflictMsg}</Text>
            )}
            <List>
              <Section header="Ваши подписки">
                {allSubs.map((sub) => (
                  <Cell
                    key={sub.id}
                    subtitle={sub.target.name}
                    after={
                      <div className={styles.cellActions}>
                        <Switch
                          checked={sub.enabled}
                          onChange={(e) =>
                            handleToggle(sub.id, e.target.checked)
                          }
                        />
                        <IconButton
                          mode="plain"
                          size="s"
                          className={styles.deleteBtn}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(sub.id)
                          }}
                          aria-label="Удалить"
                        >
                          <CloseIcon />
                        </IconButton>
                      </div>
                    }
                  >
                    {notifLabel(sub)}
                  </Cell>
                ))}
              </Section>
            </List>

            <div className={styles.footer}>
              <Button
                size="m"
                stretched
                onClick={() => {
                  setConflictMsg(null)
                  setAddStep("type")
                }}
                disabled={createMutation.isPending}
              >
                {targetName
                  ? `Подписаться на ${targetName}`
                  : "Добавить уведомление"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

function formatBeforeMinutes(minutes: number): string {
  if (minutes < 60) return `За ${minutes} мин до пары`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `За ${h} ч до пары`
  return `За ${h} ч ${m} мин до пары`
}
