/**
 * max-relay-shim — пропуск сообщений релея через фильтр origin в SDK MAX.
 *
 * Проверяется тот самый файл, который выкладывается рядом с релеем (tools/max-relay-shim),
 * а не его копия: он отдаётся как статика, минуя сборку, и разойтись с тестом ему проще
 * всего. Ошибка здесь означала бы либо молчащий мост, либо дыру в доверии — и то и другое
 * проявилось бы только внутри мессенджера.
 */

import { describe, expect, it, beforeEach, afterEach } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const SHIM = readFileSync(
  resolve(import.meta.dirname, "../adapters/max/relay-shim.js"),
  "utf8"
)

const RELAY = "https://relay.example.test"

/** Фильтр входящих из max-web-app.js — дословно. */
const SDK_ORIGIN_FILTER = /^https:\/\/.*\.(?:max|oneme)\.ru$/

type FakeWindow = EventTarget & {
  parent?: unknown
  location: { href: string }
  __maxRelayShimInstalled?: boolean
}

/**
 * «unit»-проект гоняет тесты в node, полноценный DOM здесь не нужен: шиму хватает
 * addEventListener/dispatchEvent, а MessageEvent в node настоящий — именно его поведение
 * (задаваемый origin) мы и проверяем.
 */
const runShim = (win: FakeWindow, dataset: Record<string, string> = {}) => {
  const document = { currentScript: { src: `${RELAY}/max-relay-shim.js`, dataset } }
  new Function("window", "document", "console", "URL", "MessageEvent", SHIM)(
    win,
    document,
    console,
    URL,
    MessageEvent
  )
}

const makeWindow = (): FakeWindow => {
  const win = new EventTarget() as FakeWindow
  win.parent = win
  win.location = { href: `${RELAY}/` }
  return win
}

/** Слушатель на месте SDK: принимает ровно по тем же правилам. */
const listenLikeSdk = (win: FakeWindow) => {
  const received: string[] = []
  win.addEventListener("message", (event) => {
    const message = event as MessageEvent
    if (!SDK_ORIGIN_FILTER.test(message.origin)) return
    if (typeof message.data !== "string") return
    received.push(message.data)
  })
  return received
}

/**
 * Настоящее сообщение от родителя. `source` браузер проставляет сам, а через конструктор его
 * задать нельзя — дописываем полем, чтобы проверка шима работала как в бою.
 */
const deliver = (win: FakeWindow, origin: string, data: string) => {
  const event = new MessageEvent("message", { data, origin })
  Object.defineProperty(event, "source", { value: win.parent })
  win.dispatchEvent(event)
}

describe("max-relay-shim", () => {
  let win: FakeWindow

  beforeEach(() => {
    win = makeWindow()
  })

  afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window
  })

  it("сообщение релея доходит до SDK, хотя его origin фильтр не проходит", () => {
    // Суть схемы: без подстановки SDK выбросил бы это молча — вместе с ответами на запросы
    // и нажатием «назад».
    expect(SDK_ORIGIN_FILTER.test(RELAY)).toBe(false)

    const received = listenLikeSdk(win)
    runShim(win)

    deliver(win, RELAY, '{"type":"WebAppBackButtonPressed"}')

    expect(received).toEqual(['{"type":"WebAppBackButtonPressed"}'])
  })

  it("по умолчанию доверяет ровно тому origin, с которого загружен", () => {
    const received = listenLikeSdk(win)
    runShim(win)

    deliver(win, "https://evil.example.com", '{"type":"WebAppBackButtonPressed"}')

    expect(received).toEqual([])
  })

  it("звёздочку в списке доверенных не принимает: лучше не завестись, чем нараспашку", () => {
    const received = listenLikeSdk(win)
    runShim(win, { trustOrigins: "*" })

    deliver(win, "https://evil.example.com", '{"type":"WebAppBackButtonPressed"}')
    deliver(win, RELAY, '{"type":"WebAppBackButtonPressed"}')

    expect(received).toEqual([])
  })

  it("передиспетч не зацикливается и не задваивает сообщения", () => {
    const received = listenLikeSdk(win)
    runShim(win)

    deliver(win, RELAY, '{"type":"WebAppSecureStorageGetKey","requestId":"1"}')

    // Задвоение означало бы ответ на запрос дважды и «назад» через два экрана сразу.
    expect(received).toHaveLength(1)
  })

  it("повторное подключение не задваивает сообщения", () => {
    const received = listenLikeSdk(win)
    runShim(win)
    runShim(win)

    deliver(win, RELAY, '{"type":"WebAppBackButtonPressed"}')

    expect(received).toHaveLength(1)
  })
})
