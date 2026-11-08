/**
 * The start page of the isolated host.
 *
 * Two modes, one page:
 *  - dev bench (DevKit): registered modules, their routes, their widgets, the
 *    registry status and switches for guest/authenticated, platform and theme;
 *  - production entry (delivery): a plain door into the module, nothing else.
 *
 * This is deliberately NOT the portal storefront: no module catalogue, no
 * navigation between modules, no portal onboarding. A deep link into the
 * module bypasses this page entirely — that is how the mini app opens from a
 * bot, and it must keep working.
 */

import React from "react"
import { Link } from "react-router-dom"
import { moduleRegistry, useModuleStatus } from "@portal/runtime"
import { useSdk } from "@portal/module-sdk"
import { HOST_CONFIG } from "../host.config"
import { useMockEnv } from "@portal/runtime/demo"
import styles from "./DashboardPage.module.css"

function firstRoutePath(): string | null {
  const routes = moduleRegistry.getRoutes()
  const concrete = routes.find((r) => !r.path.includes(":") && r.path !== "*")
  return concrete?.path ?? routes[0]?.path ?? null
}

const EnvironmentControls: React.FC = () => {
  const { env, setEnv, reset } = useMockEnv()

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Окружение</h2>
      <p className={styles.hint}>
        Всё, что модуль видит через SDK. Переключатели меняют мок-реализацию —
        боевые системы не задействованы.
      </p>

      <div className={styles.controls}>
        <label className={styles.control}>
          <span>Пользователь</span>
          <select
            value={env.authenticated ? "auth" : "guest"}
            onChange={(e) => setEnv({ authenticated: e.target.value === "auth" })}
          >
            <option value="guest">Гость</option>
            <option value="auth">Авторизован</option>
          </select>
        </label>

        <label className={styles.control}>
          <span>Платформа</span>
          <select
            value={env.platform}
            onChange={(e) =>
              setEnv({ platform: e.target.value as typeof env.platform })
            }
          >
            <option value="max">MAX</option>
            <option value="telegram">Telegram</option>
            <option value="web">Веб</option>
          </select>
        </label>

        <label className={styles.control}>
          <span>Тема</span>
          <select
            value={env.theme}
            onChange={(e) => setEnv({ theme: e.target.value as typeof env.theme })}
          >
            <option value="light">Светлая</option>
            <option value="dark">Тёмная</option>
          </select>
        </label>

        <label className={styles.control}>
          <span>Задержка API</span>
          <select
            value={String(env.latencyMs)}
            onChange={(e) => setEnv({ latencyMs: Number(e.target.value) })}
          >
            <option value="0">нет</option>
            <option value="300">300 мс</option>
            <option value="1500">1.5 с</option>
          </select>
        </label>
      </div>

      <button className={styles.linkButton} onClick={reset}>
        Сбросить окружение
      </button>
    </section>
  )
}

const RegistryPanel: React.FC = () => {
  const { status, error, retry } = useModuleStatus()
  const modules = status === "ready" ? moduleRegistry.getAll() : []
  const routes = status === "ready" ? moduleRegistry.getRoutes() : []

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Реестр модулей</h2>
      <p className={styles.status}>
        Статус: <strong>{status}</strong>
        {error ? ` — ${error.message}` : ""}
        {status === "error" && (
          <button className={styles.linkButton} onClick={retry}>
            Повторить
          </button>
        )}
      </p>

      {modules.length === 0 ? (
        <p className={styles.hint}>
          Ни одного модуля не зарегистрировано. Композиционный корень —
          <code> src/modules.config.ts</code>.
        </p>
      ) : (
        <ul className={styles.list}>
          {modules.map((m) => (
            <li key={m.slug} className={styles.listItem}>
              <span className={styles.moduleName}>{m.name}</span>
              <span className={styles.badge}>v{m.version}</span>
              <span className={styles.badge}>
                SDK {m.contractVersion ?? "не объявлен"}
              </span>
            </li>
          ))}
        </ul>
      )}

      <h3 className={styles.subTitle}>Маршруты</h3>
      {routes.length === 0 ? (
        <p className={styles.hint}>Модули не объявили маршрутов.</p>
      ) : (
        <ul className={styles.list}>
          {routes.map((r) => (
            <li key={r.path} className={styles.listItem}>
              {r.path.includes(":") ? (
                <code>{r.path}</code>
              ) : (
                <Link to={r.path}>
                  <code>{r.path}</code>
                </Link>
              )}
              <span className={styles.badge}>{r.meta?.guard ?? "public"}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

const WidgetsPanel: React.FC = () => {
  const { status } = useModuleStatus()
  const slots =
    status === "ready"
      ? Array.from(
          new Set(
            moduleRegistry
              .getAll()
              .flatMap((m) => Object.keys(m.widgets ?? {}))
          )
        )
      : []

  if (slots.length === 0) return null

  return (
    <section className={styles.card}>
      <h2 className={styles.cardTitle}>Виджеты</h2>
      <p className={styles.hint}>
        Так виджет выглядит в слоте портала — поднимать портал для проверки не
        нужно.
      </p>
      {slots.map((slot) => (
        <div key={slot} className={styles.slot}>
          <p className={styles.slotName}>{slot}</p>
          {moduleRegistry.getWidgets(slot).map(({ moduleName, render }) => (
            <div key={moduleName} className={styles.widgetFrame}>
              {render()}
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}

export const DashboardPage: React.FC = () => {
  const sdk = useSdk()
  const entry = HOST_CONFIG.moduleEntryPath ?? firstRoutePath()

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>{HOST_CONFIG.appName}</h1>
        <p className={styles.subtitle}>
          {HOST_CONFIG.profile === "mock"
            ? "Изолированный хост, данные — моки. Ни доступов, ни внешних сервисов не требуется."
            : "Изолированный хост, боевые данные."}
        </p>
      </header>

      {entry && (
        <Link className={styles.primaryLink} to={entry}>
          Открыть модуль →
        </Link>
      )}

      {HOST_CONFIG.showDevDashboard && (
        <>
          <RegistryPanel />
          <WidgetsPanel />
          {sdk.environment.isMock && <EnvironmentControls />}
          <footer className={styles.footer}>
            Контракт SDK: {sdk.contractVersion} · хост: {sdk.environment.host} ·
            платформа: {sdk.environment.platform}
          </footer>
        </>
      )}
    </div>
  )
}

export default DashboardPage
