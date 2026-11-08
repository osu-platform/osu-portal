import { Modal } from "@portal/shared-ui"
import { useState } from "react"
import dayjs from "dayjs"
import styles from "./AboutModal.module.css"
import { clearOnboardingStorage } from "../features/schedule-onboarding/storage"
import { useSdk } from "@portal/module-sdk"

declare const __GIT_HASH__: string
declare const __BUILD_DATE__: string

const IconCalendar = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect
      x="2"
      y="4"
      width="18"
      height="16"
      rx="3"
      stroke="var(--p-color-accent)"
      strokeWidth="1.6"
    />
    <path
      d="M2 9h18"
      stroke="var(--p-color-accent)"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M7 2v4M15 2v4"
      stroke="var(--p-color-accent)"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <rect
      x="6"
      y="12"
      width="3"
      height="3"
      rx="0.5"
      fill="var(--p-color-accent)"
    />
    <rect
      x="10"
      y="12"
      width="3"
      height="3"
      rx="0.5"
      fill="var(--p-color-accent)"
      opacity="0.5"
    />
    <rect
      x="14"
      y="12"
      width="3"
      height="3"
      rx="0.5"
      fill="var(--p-color-accent)"
      opacity="0.5"
    />
  </svg>
)

const IconBell = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path
      d="M11 3a6 6 0 0 1 6 6v3.5l1.5 2.5H3.5L5 12.5V9a6 6 0 0 1 6-6z"
      stroke="var(--p-color-success)"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M9 17a2 2 0 0 0 4 0"
      stroke="var(--p-color-success)"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
)

const IconStar = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path
      d="M11 2l2.47 5.02L19 8.18l-4 3.9.94 5.5L11 15l-4.94 2.58.94-5.5-4-3.9 5.53-.16L11 2z"
      stroke="var(--p-color-warning)"
      strokeWidth="1.6"
      strokeLinejoin="round"
      fill="var(--p-color-warning)"
      fillOpacity="0.15"
    />
  </svg>
)

type Props = { open: boolean; onOpenChange: (v: boolean) => void }

export const AboutModal = ({ open, onOpenChange }: Props) => {
  const [showDiag, setShowDiag] = useState(false)
  const [showLicense, setShowLicense] = useState(false)
  const [onboardingReset, setOnboardingReset] = useState(false)

  const handleResetOnboarding = () => {
    clearOnboardingStorage()
    setOnboardingReset(true)
    setTimeout(() => setOnboardingReset(false), 2000)
  }

  const buildDate = dayjs(__BUILD_DATE__)
  const buildFormatted = buildDate.format("DD.MM.YYYY HH:mm")

  const diagnostics = useEnvironmentDiagnostics()
  const diag = showDiag ? diagnostics : null

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      header={<Modal.Header>О приложении</Modal.Header>}
    >
      <div className={styles.container}>
        {/* Hero */}
        <div className={styles.hero}>
          <p className={styles.heroTitle}>Портал ОГУ</p>
          <p className={styles.heroSubtitle}>
            {/* Официальное приложение федерального государственного бюджетного
            образовательного учреждения высшего образования «Оренбургский
            государственный университет имени В.А. Бондаренко» */}
          </p>
        </div>

        {/* Features */}
        <div className={styles.features}>
          <div className={styles.featureRow}>
            <div className={styles.featureIconWrap}>
              <IconCalendar />
            </div>
            <div>
              <p className={styles.featureTitle}>Расписание занятий</p>
              <p className={styles.featureDesc}>
                Расписание групп, преподавателей и аудиторий
              </p>
            </div>
          </div>
          <div className={styles.featureRow}>
            <div className={styles.featureIconWrap}>
              <IconBell />
            </div>
            <div>
              <p className={styles.featureTitle}>Уведомления о парах</p>
              <p className={styles.featureDesc}>
                Напоминания перед началом занятий
              </p>
            </div>
          </div>
          <div className={styles.featureRow}>
            <div className={styles.featureIconWrap}>
              <IconStar />
            </div>
            <div>
              <p className={styles.featureTitle}>Избранное</p>
              <p className={styles.featureDesc}>
                Быстрый доступ к нужным расписаниям
              </p>
            </div>
          </div>
        </div>

        {/* Authors — required by УФЭР standard (Приложение №5, п. 1.3) */}
        <p className={styles.sectionTitle}>Авторы</p>
        <div className={styles.group}>
          <div className={styles.row}>
            <span className={styles.label}>Шевлюк Василий</span>
            <span className={styles.value}>Автор проекта</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Колядин Дмитрий</span>
            <span className={styles.value}>Автор проекта</span>
          </div>
        </div>

        {/* Version info */}
        <p className={styles.sectionTitle}>Версия</p>
        <div className={styles.group}>
          <div className={styles.row}>
            <span className={styles.label}>Коммит</span>
            <span className={styles.value}>{__GIT_HASH__}</span>
          </div>
          <div className={styles.rowLast}>
            <span className={styles.label}>Дата сборки</span>
            <span className={styles.value}>{buildFormatted}</span>
          </div>
        </div>

        <p className={styles.sectionTitle}>Пользовательское соглашение</p>
        <div className={styles.group}>
          <button
            onClick={() => setShowLicense((v) => !v)}
            className={styles.toggleButton}
          >
            {showLicense ? "Скрыть" : "Показать соглашение"}
          </button>
          {showLicense && (
            <div className={styles.licenseText}>
              <h2>Пользовательское соглашение</h2>
              <p>
                Настоящее Пользовательское соглашение регулирует отношения между
                разработчиками проекта «Портал ОГУ» и пользователем приложения в
                мессенджере Max.
              </p>

              <h3>1. Общие положения</h3>
              <p>
                Использование приложения означает полное согласие с условиями
                данного документа. Приложение является студенческой
                инициативой и не является официальным программным
                обеспечением ФГБОУ ВО «Оренбургский государственный
                университет».
              </p>

              <h3>2. Предмет соглашения</h3>
              <p>
                Приложение предоставляет доступ к справочной и учебной
                информации. Сервис предоставляется на условиях «как есть» (as
                is). Разработчики не гарантируют бесперебойность отображаемых
                данных, так как они зависят от работы внешних систем API вуза.
              </p>

              <h3>3. Ограничение ответственности</h3>
              <p>
                Разработчики не несут ответственности за любые убытки, возникшие
                в результате использования приложения. Пользователь понимает,
                что информация в приложении может иметь задержку по сравнению с
                официальными источниками.
              </p>

              <h3>4. Обработка данных</h3>
              <p>
                Демонстрация использует вымышленные данные. При подключении
                собственных серверов состав обрабатываемых данных определяется
                настройками и правилами владельца этих серверов.
              </p>

              <h3>5. Интеллектуальная собственность</h3>
              <p>
                Авторский код проекта принадлежит команде DAVG. Сторонние
                компоненты сохраняют собственные лицензии и авторские права.
                Условия использования и распространения указаны в LICENSE и
                THIRD_PARTY_NOTICES.md.
              </p>

              {/* <h3>6. Контакты</h3>
              <p>
                По всем вопросам вы можете обратиться к разработчикам в нашем
                чате поддержки в мессенджере Max.
              </p> */}
            </div>
          )}
        </div>

        {/* Onboarding reset */}
        <p className={styles.sectionTitle}>Обучение</p>
        <div className={styles.group}>
          <button
            onClick={handleResetOnboarding}
            className={styles.toggleButton}
            style={
              onboardingReset ? { color: "var(--p-color-success)" } : undefined
            }
          >
            {onboardingReset ? "Онбординг сброшен" : "Пройти обучение заново"}
          </button>
        </div>

        {/* Diagnostics */}
        <p className={styles.sectionTitle}>Диагностика окружения</p>
        <div className={styles.group}>
          <button
            onClick={() => setShowDiag((v) => !v)}
            className={styles.toggleButton}
          >
            {showDiag ? "Скрыть" : "Показать диагностику"}
          </button>
          {showDiag && diag && (
            <>
              <div className={styles.row}>
                <span className={styles.label}>Платформа</span>
                <span
                  className={
                    diag.hasPlatformUser ? styles.valueSuccess : styles.valueError
                  }
                >
                  {diag.platform}
                  {diag.isMock ? " (моки)" : ""}
                </span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>Хост / контракт</span>
                <span className={styles.value}>
                  {diag.host} · SDK {diag.contractVersion}
                </span>
              </div>
              <div className={styles.rowLast}>
                <span className={styles.label}>User ID</span>
                <span
                  className={
                    diag.userId ? styles.valueSuccess : styles.valueError
                  }
                >
                  {diag.userId ?? "✗ не найден"}
                </span>
              </div>
            </>
          )}
        </div>

        {/* © 2026 DAVG. Все права защищены. */}
        <p className={styles.copyright}>© 2026 DAVG. Все права защищены.</p>
      </div>
    </Modal>
  )
}

/**
 * Diagnostics from the SDK rather than from platform globals.
 * The module no longer knows or cares what MAX's SDK looks like — if it runs
 * somewhere else tomorrow, this panel keeps working.
 */
function useEnvironmentDiagnostics() {
  const { user, environment, contractVersion } = useSdk()
  return {
    hasPlatformUser: user.platformUserId !== null,
    platform: environment.platform,
    host: environment.host,
    isMock: environment.isMock,
    contractVersion,
    userId: user.platformUserId,
  }
}
