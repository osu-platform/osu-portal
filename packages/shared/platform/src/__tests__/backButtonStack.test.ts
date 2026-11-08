/**
 * Кнопка «назад» в шапке хоста.
 *
 * Проверяется то, что нельзя увидеть в браузере и трудно проверить руками внутри
 * мессенджера: кто отвечает на нажатие, когда кнопка видна и что остаётся в мосте после
 * ухода с экрана. Эти три вещи и дают дефекты, ради которых стек написан — кнопка, уводящая
 * не туда, и закрытие мини-приложения при открытой шторке.
 */

import { describe, expect, it, vi, afterEach, beforeAll } from "vitest"
import { createBackButtonStack } from "../backButtonStack"
import { createMaxBackButtonAdapter } from "../adapters/max/backButton"
import { probeMaxBridge } from "../adapters/max/bridgeProbe"
import type { BackButtonAdapter } from "../adapters/base"

/** Мост мессенджера: тот же набор методов, что у MAX и Telegram, плюс press(). */
function fakeAdapter(supported = true) {
  const callbacks = new Set<() => void>()
  const state = {
    visible: false,
    supported,
    show: () => {
      state.visible = true
    },
    hide: () => {
      state.visible = false
    },
    onClick: (cb: () => void) => {
      callbacks.add(cb)
    },
    offClick: (cb: () => void) => {
      callbacks.delete(cb)
    },
  }
  const adapter: BackButtonAdapter = {
    isSupported: () => state.supported,
    show: () => state.show(),
    hide: () => state.hide(),
    onClick: (cb) => state.onClick(cb),
    offClick: (cb) => state.offClick(cb),
  }
  return {
    adapter,
    isVisible: () => state.visible,
    subscribed: () => callbacks.size,
    press: () => {
      for (const cb of [...callbacks]) cb()
    },
  }
}

// «unit»-проект гоняет тесты в node, а адаптеры читают window. Полноценный DOM здесь не
// нужен — адаптеру достаточно одного поля, — поэтому подставляем пустой объект вместо того,
// чтобы тащить в зависимости jsdom ради двух проверок.
beforeAll(() => {
  if (typeof globalThis.window === "undefined") {
    ;(globalThis as unknown as { window: unknown }).window = {}
  }
})

afterEach(() => {
  vi.useRealTimers()
  delete (window as unknown as { WebApp?: unknown }).WebApp
  delete (window as unknown as { WebViewHandler?: unknown }).WebViewHandler
})

describe("стек обработчиков кнопки «назад»", () => {
  it("кнопки нет, пока возврат никто не занял, и появляется вместе с экраном", () => {
    const host = fakeAdapter()
    const stack = createBackButtonStack(host.adapter)

    expect(host.isVisible()).toBe(false)

    const release = stack.register(() => {})
    expect(host.isVisible()).toBe(true)

    // Экран ушёл — кнопку убрали: на корневом экране «назад» мессенджера означает выход
    // из мини-приложения, и висящая кнопка, которая ничего не делает, ломает этот выход.
    release()
    expect(host.isVisible()).toBe(false)
  })

  it("нажатие получает верхний обработчик: сначала закрывается оверлей, потом уходит экран", () => {
    vi.useFakeTimers()
    const host = fakeAdapter()
    const stack = createBackButtonStack(host.adapter)
    const screen = vi.fn()
    const overlay = vi.fn()

    stack.register(screen)
    const closeOverlay = stack.register(overlay)

    host.press()
    expect(overlay).toHaveBeenCalledTimes(1)
    expect(screen).not.toHaveBeenCalled()

    closeOverlay()
    vi.advanceTimersByTime(1000)
    host.press()
    expect(screen).toHaveBeenCalledTimes(1)
  })

  it("два нажатия подряд считаются одним — иначе двойной тап прыгает через экран", () => {
    const host = fakeAdapter()
    const stack = createBackButtonStack(host.adapter)
    const screen = vi.fn()
    stack.register(screen)

    host.press()
    host.press()

    expect(screen).toHaveBeenCalledTimes(1)
  })

  it("после dispose в мосте не остаётся ни обработчика, ни видимой кнопки", () => {
    const host = fakeAdapter()
    const stack = createBackButtonStack(host.adapter)
    const screen = vi.fn()
    stack.register(screen)
    expect(host.subscribed()).toBe(1)

    stack.dispose()

    expect(host.subscribed()).toBe(0)
    expect(host.isVisible()).toBe(false)
    host.press()
    expect(screen).not.toHaveBeenCalled()
  })

  it("там, где хост кнопку не рисует, регистрация ничего не делает", () => {
    const host = fakeAdapter(false)
    const stack = createBackButtonStack(host.adapter)
    const screen = vi.fn()

    stack.register(screen)

    expect(stack.isSupported()).toBe(false)
    expect(host.isVisible()).toBe(false)
    expect(host.subscribed()).toBe(0)
  })
})

/**
 * Признак поддержки у MAX — не платформа, а ответ клиента на пробу. Мост принимает вызовы и
 * молча выбрасывает их, когда мини-приложение открыто не с зарегистрированного за ботом
 * origin: `show()` проходит, `isVisible` отвечает `true`, стрелки нет. Поэтому здесь всюду
 * сначала проба, и проверяется именно её влияние.
 */
describe("адаптер MAX", () => {
  const fullBridge = {
    show: () => {},
    hide: () => {},
    onClick: () => {},
    offClick: () => {},
  }

  /** Клиент, отвечающий на запросы, — то есть мост живой в обе стороны. */
  const answering = (BackButton: unknown) => ({
    platform: "web",
    BackButton,
    getLaunchContext: () => Promise.resolve({}),
  })

  it("без моста кнопки нет", async () => {
    ;(window as unknown as { WebApp: unknown }).WebApp = undefined
    await probeMaxBridge()
    expect(createMaxBackButtonAdapter().isSupported()).toBe(false)
  })

  it("клиент ответил на пробу — кнопка есть, в том числе в вебе", async () => {
    // Прежде здесь стояло обратное ожидание: веб исключался целиком. Вывод был сделан по
    // проверке со стенда на чужом origin — с зарегистрированного клиент кнопку рисует.
    ;(window as unknown as { WebApp: unknown }).WebApp = answering(fullBridge)
    await probeMaxBridge()
    expect(createMaxBackButtonAdapter().isSupported()).toBe(true)
  })

  it("клиент молчит — на кнопку не полагаемся, даже если мост на месте", async () => {
    vi.useFakeTimers()
    ;(window as unknown as { WebApp: unknown }).WebApp = {
      platform: "web",
      // Мост отвечает `true` про видимость и после того, как клиент выбросил событие.
      BackButton: { ...fullBridge, isVisible: true },
      getLaunchContext: () => new Promise(() => {}),
    }
    const probe = probeMaxBridge()
    await vi.advanceTimersByTimeAsync(2000)
    await probe
    vi.useRealTimers()

    expect(createMaxBackButtonAdapter().isSupported()).toBe(false)
  })

  it("при нативном мосте пробы нет: на телефоне origin не проверяется", async () => {
    // Регрессия, которую легко внести: на телефоне SDK ходит через WebViewHandler, а не
    // postMessage. Промолчи клиент на незнакомый метод — проба погасила бы кнопку там, где
    // она работала всегда.
    ;(window as unknown as { WebViewHandler: unknown }).WebViewHandler = { postEvent: () => {} }
    ;(window as unknown as { WebApp: unknown }).WebApp = {
      platform: "android",
      BackButton: fullBridge,
      getLaunchContext: () => new Promise(() => {}),
    }

    await probeMaxBridge()

    expect(createMaxBackButtonAdapter().isSupported()).toBe(true)
  })

  it("неполный мост кнопкой не считается", async () => {
    ;(window as unknown as { WebApp: unknown }).WebApp = answering({
      show: () => {},
      hide: () => {},
    })
    await probeMaxBridge()
    expect(createMaxBackButtonAdapter().isSupported()).toBe(false)
  })

  it("отказ моста не роняет приложение", async () => {
    ;(window as unknown as { WebApp: unknown }).WebApp = answering({
      ...fullBridge,
      show: () => {
        throw new Error("мост сломался")
      },
    })
    await probeMaxBridge()
    const adapter = createMaxBackButtonAdapter()
    expect(() => adapter.show()).not.toThrow()
  })
})
