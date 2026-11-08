import { getSdk } from "@portal/module-sdk"
import {
  Button,
  Cell,
  Input,
  Modal,
  Section,
  Text,
  Snackbar,
  Spoiler,
  ModalHeader,
} from "@portal/shared-ui"
import { useMemo, useState } from "react"
import { ScheduleTarget } from "../../../../hooks/useSelectOptions/store"
import { useNative } from "@portal/shared-platform"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  confirmed: ScheduleTarget
}

const AddToCalendarModal = ({ open, onOpenChange, confirmed }: Props) => {
  const [isCopied, setIsCopied] = useState(false)
  const native = useNative()

  const getCalendarLink = (
    type: "group" | "teacher" | "audience",
    id: string
  ) => {
    let url = getSdk().config.calendarExportUrl

    if (type === "group" && id) {
      url += `?group_id=${id}`
    } else if (type === "teacher" && id) {
      url += `?prep_id=${id}`
    } else if (type === "audience" && id) {
      url += `?aud_id=${id}`
    }

    return url
  }

  const link = useMemo(
    () =>
      getCalendarLink(
        confirmed?.type as "group" | "teacher" | "audience",
        confirmed?.id as string
      ),
    [confirmed]
  )

  const handleCopy = () => {
    navigator.clipboard.writeText(link).then(() => {
      native.hapticFeedback("success")
      setIsCopied(true)

      setTimeout(() => {
        setIsCopied(false)
      }, 3000)
    })
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      header={
        <ModalHeader
          style={{
            backgroundColor: "var(--p-color-bg-secondary)",
          }}
        >
          Добавить в календарь
        </ModalHeader>
      }
    >
      <div
        style={{
          width: "100%",
          backgroundColor: "var(--p-color-bg-secondary)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          paddingBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            textAlign: "center",
            padding: "8px 20px 0",
          }}
        >
          {/* <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              backgroundColor: "var(--p-color-bg-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Calendar
              style={{ width: 40, height: 40 }}
              color="var(--p-color-link)"
            />
          </div> */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              maxWidth: 420,
            }}
          >
            <Text weight="2">Синхронизация расписания</Text>

            <Text
              style={{
                color: "var(--p-color-text-tertiary)",
                lineHeight: 1.45,
              }}
            >
              Подключите расписание к вашему календарю. Все изменения будут
              обновляться автоматически.
            </Text>
          </div>
        </div>

        <Section header="Ссылка для подписки">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: "0 16px 16px",
            }}
          >
            <div
              style={{
                width: "100%",
              }}
            >
              <Input
                readOnly
                value={link}
                style={{
                  width: "100%",
                  backgroundColor: "var(--p-color-bg-primary)",
                  fontSize: 13,
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                width: "100%",
                flexWrap: "wrap",
              }}
            >
              <Button
                size="m"
                stretched
                onClick={handleCopy}
                style={{
                  minWidth: 0,
                  flex: 1,
                }}
              >
                {isCopied ? "Скопировано" : "Копировать ссылку"}
              </Button>

              {/* <Button
                size="m"
                mode="secondary"
                stretched
                onClick={handleOpenCalendar}
                style={{
                  minWidth: 0,
                  flex: 1,
                }}
              >
                Открыть ссылку
              </Button> */}
            </div>
          </div>
        </Section>
        <Section header="Как подключить">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: "0 16px",
            }}
          >
            <Cell
              multiline
              style={{
                borderRadius: 18,
                backgroundColor: "var(--p-color-bg-primary)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <Text weight="2">Google Calendar</Text>

                    <Text
                      style={{
                        color: "var(--p-color-text-tertiary)",
                        fontSize: 14,
                      }}
                    >
                      Android · Web
                    </Text>
                  </div>

                  <div
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      backgroundColor: "var(--p-color-bg-secondary)",
                      fontSize: 13,
                      color: "var(--p-color-link)",
                      fontWeight: 500,
                      flexShrink: 0,
                    }}
                  >
                    <Spoiler>Рекомендуется</Spoiler>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {[
                    "Откройте Google Календарь",
                    "В разделе «Другие календари» нажмите «+»",
                    "Выберите «Добавить по URL»",
                    "Вставьте скопированную ссылку",
                  ].map((step, index) => (
                    <div
                      key={step}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          backgroundColor:
                            "var(--p-color-bg-secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--p-color-link)",
                          marginTop: 1,
                        }}
                      >
                        {index + 1}
                      </div>

                      <Text
                        style={{
                          lineHeight: 1.45,
                        }}
                      >
                        {step}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            </Cell>

            <Cell
              multiline
              style={{
                borderRadius: 18,
                backgroundColor: "var(--p-color-bg-primary)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <Text weight="2">Apple Calendar</Text>

                  <Text
                    style={{
                      color: "var(--p-color-text-tertiary)",
                      fontSize: 14,
                    }}
                  >
                    iPhone · iPad · macOS
                  </Text>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {[
                    "Откройте приложение «Календарь»",
                    "Нажмите «Календари» внизу экрана",
                    "Выберите «Добавить календарь» → «По подписке»",
                    "Вставьте ссылку и нажмите «Подписаться»",
                  ].map((step, index) => (
                    <div
                      key={step}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          backgroundColor:
                            "var(--p-color-bg-secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--p-color-link)",
                          marginTop: 1,
                        }}
                      >
                        {index + 1}
                      </div>

                      <Text
                        style={{
                          lineHeight: 1.45,
                        }}
                      >
                        {step}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            </Cell>
          </div>
        </Section>
      </div>

      {isCopied && (
        <Snackbar
          onClose={() => setIsCopied(false)}
          duration={3000}
          description="Ссылка скопирована в буфер обмена"
        >
          Успешно
        </Snackbar>
      )}
    </Modal>
  )
}

export default AddToCalendarModal
