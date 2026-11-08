/**
 * Main Application Component
 *
 * Sets up providers and renders the runtime Application with the portal's own
 * routes and layout. The runtime is shared verbatim with apps/module-host —
 * only what is passed in here differs.
 */

import React from "react"
import { BrowserRouter } from "react-router-dom"
import {
  ApiProvider,
  AuthProvider,
  QueryProvider,
  RuntimeProvider,
  ThemeProvider,
  ModuleProvider,
} from "./providers"
import { Application, RuntimeSdkProvider, setRedirectPolicy } from "@portal/runtime"
import { portalRoutes, portalDeepLinks, PORTAL_REDIRECT_POLICY } from "@portal/shell"
import { AppRoot } from "@portal/shared-ui"
import { dotLottieWasmUrl } from "@portal/shared-assets"
import { setWasmUrl } from "@lottiefiles/dotlottie-react"
import NuqsProvider from "./providers/NuqsProvider"

setWasmUrl(dotLottieWasmUrl)
setRedirectPolicy(PORTAL_REDIRECT_POLICY)

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[AppErrorBoundary]", error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px 24px", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
          <p style={{ fontSize: 16, marginBottom: 20 }}>
            Что-то пошло не так. Попробуйте перезагрузить страницу.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 28px",
              fontSize: 15,
              borderRadius: 10,
              border: "none",
              background: "#007aff",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Перезагрузить
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const LiveApp: React.FC = () => {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <NuqsProvider>
          <QueryProvider>
            <RuntimeProvider>
              <ApiProvider>
                <AuthProvider>
                  <ThemeProvider>
                    <AppRoot>
                      <RuntimeSdkProvider host="portal">
                        <ModuleProvider>
                          <AppErrorBoundary>
                            <Application
                              routes={portalRoutes}
                              coreDeepLinks={portalDeepLinks}
                            />
                          </AppErrorBoundary>
                        </ModuleProvider>
                      </RuntimeSdkProvider>
                    </AppRoot>
                  </ThemeProvider>
                </AuthProvider>
              </ApiProvider>
            </RuntimeProvider>
          </QueryProvider>
        </NuqsProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  )
}

const DemoApp = React.lazy(() => import('./DemoApp'))
export const App: React.FC = () => import.meta.env.VITE_DATA_PROFILE === 'live'
  ? <LiveApp />
  : <React.Suspense fallback={null}><DemoApp /></React.Suspense>
