/**
 * @portal/module-sdk/mock
 *
 * The fixture-backed implementation of the SDK contract.
 *
 * Used by the DevKit host (apps/module-host) and by module tests. This is what
 * makes "clone and it works" possible: no credentials, no endpoints, no
 * network.
 */

import type {
  ModuleSdk,
  SdkEnvironment,
  SdkNavigation,
  SdkStorage,
  SdkUser,
} from "../types"
import type { PortalConfig } from "@portal/shared-config"
import { CONTRACT_VERSION } from "../version"
import { createMemoryStorage } from "../storage"
import {
  createMockApiClient,
  type MockApiOptions,
  type MockHandler,
  type MockRequest,
} from "./api"

export type { MockHandler, MockApiOptions, MockRequest }
export { createMockApiClient }

export const MOCK_USER_GUEST: SdkUser = {
  isAuthenticated: false,
  id: null,
  platformUserId: null,
  platform: "web",
  firstName: null,
  lastName: null,
  roles: [],
}

export const MOCK_USER_AUTHENTICATED: SdkUser = {
  isAuthenticated: true,
  id: "mock-user-1",
  platformUserId: "1000001",
  platform: "max",
  firstName: "Иван",
  lastName: "Тестов",
  roles: ["student"],
}

const MOCK_CONFIG: PortalConfig = {
  apiBaseUrl: "https://mock.local/api",
  scheduleApiUrl: "https://mock.local/schedule",
  schedulePagesUrl: "https://mock.local/schedule-pages",
  scheduleSiteUrl: "https://mock.local/schedule-site",
  calendarExportUrl: "https://mock.local/calendar",
  eventsApiUrl: "https://mock.local/events",
  eventsAdminUrl: "https://mock.local/events-admin",
}

export interface CreateMockSdkOptions {
  user?: Partial<SdkUser>
  environment?: Partial<SdkEnvironment>
  config?: Partial<PortalConfig>
  storage?: SdkStorage
  handlers?: MockHandler[]
  latencyMs?: number
  /** Navigation sink — the host passes the router; tests can record calls. */
  navigation?: Partial<SdkNavigation>
  /** Signed launch string to hand modules, for exercising their auth exchange. */
  initData?: string | null
}

export function createMockSdk(options: CreateMockSdkOptions = {}): ModuleSdk {
  const user: SdkUser = { ...MOCK_USER_GUEST, ...options.user }
  const config: PortalConfig = { ...MOCK_CONFIG, ...options.config }

  const environment: SdkEnvironment = {
    host: "module-host",
    platform: user.platform,
    theme: "light",
    safeArea: { top: 0, right: 0, bottom: 0, left: 0 },
    isDev: true,
    isMock: true,
    ...options.environment,
  }

  const navigation: SdkNavigation = {
    navigate: (to) => {
      console.info(`[module-sdk/mock] navigate → ${to}`)
    },
    back: () => {
      console.info("[module-sdk/mock] back")
    },
    currentPath: () =>
      typeof window !== "undefined" ? window.location.pathname : "/",
    buildLink: (path) =>
      typeof window !== "undefined"
        ? new URL(path, window.location.origin).toString()
        : `https://mock.local${path}`,
    ...options.navigation,
  }

  return {
    contractVersion: CONTRACT_VERSION,
    user,
    api: createMockApiClient({
      handlers: options.handlers,
      baseUrl: config.apiBaseUrl,
      latencyMs: options.latencyMs,
    }),
    createApiClient: ({ baseUrl }) =>
      createMockApiClient({
        handlers: options.handlers,
        baseUrl,
        latencyMs: options.latencyMs,
      }),
    navigation,
    environment,
    storage: options.storage ?? createMemoryStorage(),
    config,
    screen: {
      requestMaxBrightness: async () => {
        console.info("[module-sdk/mock] screen.requestMaxBrightness")
      },
      restoreBrightness: async () => {
        console.info("[module-sdk/mock] screen.restoreBrightness")
      },
    },
    // Reports supported so the scan UI is exercisable in the DevKit; each
    // call prompts in the console rather than opening a real camera.
    qrScanner: {
      isSupported: () => true,
      scan: async () => {
        console.info("[module-sdk/mock] qrScanner.scan")
        const data =
          typeof window !== "undefined"
            ? window.prompt("Mock QR scan — payload to return:")
            : null
        if (!data) return { status: "cancelled" as const }
        return { status: "success" as const, data }
      },
    },
    haptics: {
      vibrate: (type) => {
        console.info(`[module-sdk/mock] haptics.vibrate(${type})`)
      },
      notify: (type) => {
        console.info(`[module-sdk/mock] haptics.notify(${type})`)
      },
    },
    // У DevKit-хоста своей шапки нет, рисовать кнопку «назад» некому — модуль должен
    // остаться при своей, как в браузерной вкладке. Сообщать «поддерживается» здесь было бы
    // прямым вредом: экран спрятал бы свою кнопку и остался без выхода.
    backButton: {
      isSupported: () => false,
      register: () => () => {},
    },
    // Fixtures answer without authentication, so there is nothing to exchange.
    // Returning null is also what a module sees outside a messenger, which
    // keeps the DevKit on the same code path as a browser tab.
    unstable_getInitData: () => options.initData ?? null,
  }
}
