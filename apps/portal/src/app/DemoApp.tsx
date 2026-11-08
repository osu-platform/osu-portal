/** Offline public profile. Live authentication remains in App.tsx. */
import React, { useEffect, useState } from "react"
import { BrowserRouter } from "react-router-dom"
import {
  Application,
  ModuleProvider,
  initializeAsGuest,
  moduleRegistry,
} from "@portal/runtime"
import { MockSdkProvider } from "@portal/runtime/demo"
import { useSdk } from "@portal/module-sdk"
import { createMockApiClient, type MockHandler } from "@portal/module-sdk/mock"
import { ApiProvider } from "@portal/shared-api"
import { RuntimeProvider, useRuntimeTheme } from "@portal/shared-platform"
import { ThemeProvider } from "@portal/shared-theme"
import { AppRoot } from "@portal/shared-ui"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { portalRoutes, portalDeepLinks } from "@portal/shell"
import { loadModules, loadMockHandlers } from "./modules.config"
import NuqsProvider from "./providers/NuqsProvider"

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const offlineApi = createMockApiClient()
function Theme({ children }: { children: React.ReactNode }) {
  const theme = useRuntimeTheme()
  return <ThemeProvider runtimeTheme={theme}>{children}</ThemeProvider>
}
function Modules() {
  const sdk = useSdk()
  useEffect(() => {
    initializeAsGuest()
    moduleRegistry.start(loadModules, { sdk })
    // The registry owns module lifetime; navigation updates SDK separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <ModuleProvider registry={moduleRegistry}>
      <aside
        role="status"
        style={{ padding: 8, background: "var(--p-color-bg-secondary)" }}
      >
        Демонстрация: вымышленные данные, изменения сохраняются только в
        браузере.
      </aside>
      <Application routes={portalRoutes} coreDeepLinks={portalDeepLinks} />
    </ModuleProvider>
  )
}
export default function DemoApp() {
  const [handlers, setHandlers] = useState<MockHandler[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    loadMockHandlers()
      .then(setHandlers)
      .catch((e) => setError(String(e)))
  }, [])
  if (error)
    return <div role="alert">Не удалось загрузить демонстрацию: {error}</div>
  if (!handlers) return <div role="status">Загрузка демонстрации…</div>
  return (
    <BrowserRouter>
      <NuqsProvider>
        <QueryClientProvider client={queryClient}>
          <RuntimeProvider>
            <ApiProvider apiClient={offlineApi}>
              <Theme>
                <AppRoot>
                  <MockSdkProvider handlers={handlers} host="portal">
                    <Modules />
                  </MockSdkProvider>
                </AppRoot>
              </Theme>
            </ApiProvider>
          </RuntimeProvider>
        </QueryClientProvider>
      </NuqsProvider>
    </BrowserRouter>
  )
}
