/**
 * The isolated host application.
 *
 * Same runtime, same providers, same Application component as the portal —
 * only the composition root, the routes and the SDK implementation differ.
 * That sameness is the guarantee behind "a module debugged here drops into the
 * portal unchanged".
 */

import React, { useEffect, useState } from "react"
import { BrowserRouter } from "react-router-dom"
import {
  Application,
  AuthProvider,
  ModuleProvider,
  RuntimeSdkProvider,
  initializeAsGuest,
  moduleRegistry,
} from "@portal/runtime"
import { useSdk } from "@portal/module-sdk"
import type { MockHandler } from "@portal/module-sdk/mock"
import { ApiProvider, createApiClient } from "@portal/shared-api"
import { RuntimeProvider, useRuntimeTheme } from "@portal/shared-platform"
import { ThemeProvider } from "@portal/shared-theme"
import { AppRoot } from "@portal/shared-ui"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { config } from "@portal/shared-config"
import { dotLottieWasmUrl } from "@portal/shared-assets"
import { setWasmUrl } from "@lottiefiles/dotlottie-react"
import { HOST_CONFIG } from "../host.config"
import { hostRoutes } from "../routes"
import { loadMockHandlers, loadModules } from "../modules.config"
import { MockSdkProvider } from "@portal/runtime/demo"

// Point the animation runtime at the bundled WASM. Without this it fetches
// from a CDN, and an isolated delivery that quietly needs the network is not
// isolated.
setWasmUrl(dotLottieWasmUrl)

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})

const apiClient = createApiClient({ baseUrl: config.apiBaseUrl })

/** Starts the registry once the SDK is in place — modules get it in init(). */
const HostModuleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const sdk = useSdk()

  useEffect(() => {
    moduleRegistry.start(loadModules, { sdk })
    // Start exactly once; the registry keeps the loader for retry().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <ModuleProvider registry={moduleRegistry}>{children}</ModuleProvider>
}

const HostThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const runtimeTheme = useRuntimeTheme()
  return <ThemeProvider runtimeTheme={runtimeTheme}>{children}</ThemeProvider>
}

/** Mock profile (DevKit) — fixtures, offline. */
const MockShell: React.FC = () => {
  const [handlers, setHandlers] = useState<MockHandler[] | null>(null)

  useEffect(() => {
    // No auth backend in this profile: the session is a guest from the start.
    initializeAsGuest()
  }, [])

  useEffect(() => {
    loadMockHandlers()
      .then(setHandlers)
      .catch((error) => {
        console.error("[module-host] Failed to load fixtures:", error)
        setHandlers([])
      })
  }, [])

  if (!handlers) return null

  return (
    <MockSdkProvider handlers={handlers}>
      <HostModuleProvider>
        <Application routes={hostRoutes} />
      </HostModuleProvider>
    </MockSdkProvider>
  )
}

/** Live profile (delivery) — the real runtime SDK. */
const LiveShell: React.FC = () => (
  <AuthProvider>
    <RuntimeSdkProvider host="module-host">
      <HostModuleProvider>
        <Application routes={hostRoutes} />
      </HostModuleProvider>
    </RuntimeSdkProvider>
  </AuthProvider>
)

export const App: React.FC = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <RuntimeProvider>
        <ApiProvider apiClient={apiClient}>
          <HostThemeProvider>
            <AppRoot>
              {HOST_CONFIG.profile === "mock" ? <MockShell /> : <LiveShell />}
            </AppRoot>
          </HostThemeProvider>
        </ApiProvider>
      </RuntimeProvider>
    </QueryClientProvider>
  </BrowserRouter>
)
