/**
 * React binding for the module SDK.
 *
 * Modules consume the SDK through hooks. The imperative accessor `getSdk()`
 * exists for code that legitimately lives outside the React tree (zustand
 * stores, query functions) — it is set by the provider and throws before it.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react"
import type { ModuleSdk } from "./types"

const SdkContext = createContext<ModuleSdk | null>(null)

/**
 * Module-scope singleton mirroring the provider value.
 * Single-app-per-page assumption — the same one the router already makes.
 */
let currentSdk: ModuleSdk | null = null

/** @internal — used by host implementations (runtime / mock). */
export function setSdk(sdk: ModuleSdk | null): void {
  currentSdk = sdk
}

/**
 * Imperative SDK access for non-React code inside a module.
 * Prefer `useSdk()` in components.
 */
export function getSdk(): ModuleSdk {
  if (!currentSdk) {
    throw new Error(
      "[module-sdk] SDK is not available yet — is <ModuleSdkProvider> mounted?"
    )
  }
  return currentSdk
}

/** Non-throwing variant for code that must degrade instead of crashing. */
export function tryGetSdk(): ModuleSdk | null {
  return currentSdk
}

export interface ModuleSdkProviderProps {
  sdk: ModuleSdk
  children: ReactNode
}

export const ModuleSdkProvider: React.FC<ModuleSdkProviderProps> = ({
  sdk,
  children,
}) => {
  // Assign during render so that code running in child module `init()` or in a
  // store created at import time already sees the SDK.
  setSdk(sdk)

  React.useEffect(() => {
    setSdk(sdk)
    return () => setSdk(null)
  }, [sdk])

  return <SdkContext.Provider value={sdk}>{children}</SdkContext.Provider>
}

export function useSdk(): ModuleSdk {
  const sdk = useContext(SdkContext)
  if (!sdk) {
    throw new Error("useSdk() must be used inside <ModuleSdkProvider>")
  }
  return sdk
}

export const useSdkUser = () => useSdk().user
export const useSdkApi = () => useSdk().api
export const useSdkNavigation = () => useSdk().navigation
export const useSdkEnvironment = () => useSdk().environment
export const useSdkStorage = () => useSdk().storage
export const useSdkConfig = () => useSdk().config

/**
 * Занять кнопку «назад» в шапке хоста, пока `enabled`.
 *
 * `enabled` — это «экран или оверлей открыт»: для страницы `true`, для модалки её признак
 * открытости. Обработчик берётся свежий на каждом нажатии, поэтому замыкать в нём состояние
 * безопасно. Там, где хост кнопки не рисует (браузер, PWA, веб-клиент MAX), хук не делает
 * ничего, и экран показывает собственную кнопку.
 */
export function useSdkBackHandler(
  enabled: boolean,
  handler: () => void
): void {
  // Через контекст напрямую, а не через useSdk(): компонент шапки рисуется и в Storybook,
  // и в тестах без провайдера, а «SDK нет» для этой кнопки означает ровно «платформенной
  // кнопки нет» — падать тут не на чем.
  const backButton = useContext(SdkContext)?.backButton
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    if (!backButton || !enabled || !backButton.isSupported()) return undefined
    return backButton.register(() => handlerRef.current())
  }, [backButton, enabled])
}

/**
 * Рисует ли хост свою кнопку «назад». Экран, отдавший ей возврат, по этому признаку
 * убирает собственную — иначе кнопок «назад» будет две.
 */
export function useSdkHasBackButton(): boolean {
  return useContext(SdkContext)?.backButton.isSupported() ?? false
}

/**
 * Memoised client for a secondary backend.
 *
 * Modules often talk to their own service in addition to the platform API.
 * Creating the client lazily (rather than at import time) is what lets the
 * mock implementation intercept it — an eagerly created axios instance would
 * escape the DevKit's offline guarantee.
 */
const apiClients = new Map<string, ReturnType<ModuleSdk["createApiClient"]>>()

export function getModuleApiClient(
  baseUrl: string,
  timeout?: number
): ReturnType<ModuleSdk["createApiClient"]> {
  const sdk = getSdk()
  const key = `${sdk.environment.isMock ? "mock" : "live"}|${baseUrl}|${timeout ?? ""}`
  let client = apiClients.get(key)
  if (!client) {
    client = sdk.createApiClient({ baseUrl, timeout })
    apiClients.set(key, client)
  }
  return client
}
