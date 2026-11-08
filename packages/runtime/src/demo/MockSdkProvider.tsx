/**
 * The DevKit's SDK: fixtures instead of systems.
 *
 * Everything a module can observe about the platform is switchable here —
 * guest vs authenticated, platform, theme — because the point of the bench is
 * to let a contributor see how their module behaves in each case without
 * access to any of our environments.
 *
 * The switches are persisted so a reload keeps the state you were debugging.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  ModuleSdkProvider,
  createLocalStorage,
  namespaceStorage,
  type ModuleSdk,
  type SdkPlatform,
  type SdkThemeMode,
  type SdkHostKind,
} from "@portal/module-sdk"
import {
  createMockSdk,
  MOCK_USER_AUTHENTICATED,
  MOCK_USER_GUEST,
  type MockHandler,
} from "@portal/module-sdk/mock"

export interface MockEnvState {
  authenticated: boolean
  platform: SdkPlatform
  theme: SdkThemeMode
  latencyMs: number
}

const DEFAULT_ENV: MockEnvState = {
  authenticated: false,
  platform: "web",
  theme: "light",
  latencyMs: 0,
}

const STORAGE_KEY = "module-host.env"

function loadEnv(): MockEnvState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_ENV
    return { ...DEFAULT_ENV, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_ENV
  }
}

interface MockEnvContextValue {
  env: MockEnvState
  setEnv: (patch: Partial<MockEnvState>) => void
  reset: () => void
}

const MockEnvContext = createContext<MockEnvContextValue | null>(null)

export function useMockEnv(): MockEnvContextValue {
  const ctx = useContext(MockEnvContext)
  if (!ctx) {
    throw new Error("useMockEnv must be used inside <MockSdkProvider>")
  }
  return ctx
}

export interface MockSdkProviderProps {
  handlers: MockHandler[]
  children: ReactNode
  host?: SdkHostKind
}

export const MockSdkProvider: React.FC<MockSdkProviderProps> = ({
  handlers,
  children,
  host = "module-host",
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [env, setEnvState] = useState<MockEnvState>(loadEnv)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(env))
    } catch {
      /* persistence is a convenience, not a requirement */
    }
  }, [env])

  const setEnv = (patch: Partial<MockEnvState>) =>
    setEnvState((prev) => ({ ...prev, ...patch }))

  const sdk = useMemo<ModuleSdk>(() => {
    const base = env.authenticated ? MOCK_USER_AUTHENTICATED : MOCK_USER_GUEST
    return createMockSdk({
      handlers,
      latencyMs: env.latencyMs,
      user: {
        ...base,
        platform: env.platform,
        // A guest inside a messenger still has a platform id — that
        // combination is exactly what breaks modules that conflate the two.
        platformUserId: env.platform === "web" ? null : "1000001",
      },
      environment: {
        host,
        theme: env.theme,
        platform: env.platform,
        isDev: Boolean(import.meta.env.DEV),
      },
      storage: namespaceStorage(createLocalStorage(), "module-host"),
      navigation: {
        navigate: (to, options) => navigate(to, { replace: options?.replace }),
        back: () => navigate(-1),
        currentPath: () => location.pathname + location.search,
      },
    })
  }, [env, handlers, navigate, location, host])

  const value = useMemo<MockEnvContextValue>(
    () => ({ env, setEnv, reset: () => setEnvState(DEFAULT_ENV) }),
    [env]
  )

  return (
    <MockEnvContext.Provider value={value}>
      <ModuleSdkProvider sdk={sdk}>{children}</ModuleSdkProvider>
    </MockEnvContext.Provider>
  )
}
