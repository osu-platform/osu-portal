/**
 * The production implementation of the module SDK.
 *
 * Same contract as @portal/module-sdk/mock, backed by real systems: the auth
 * store, the configured API client, the platform adapter and the router.
 * A module cannot tell the two apart — that is the whole point.
 */

import React, { useEffect, useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { createApiClient, useApiClient } from "@portal/shared-api"
import {
  useRuntime,
  useSafeArea,
  useRuntimeTheme,
  createBackButtonStack,
} from "@portal/shared-platform"
import { config as portalConfig } from "@portal/shared-config"
import {
  CONTRACT_VERSION,
  ModuleSdkProvider,
  createLocalStorage,
  type ModuleSdk,
  type SdkEnvironment,
  type SdkHostKind,
  type SdkBackButton,
  type SdkStorage,
  type SdkUser,
} from "@portal/module-sdk"
import { useAuthState } from "../auth"
import { getInitData } from "../auth/actions/helpers"
import { readPlatformIdentity } from "./platformUser"

export interface RuntimeSdkProviderProps {
  /** Which application is hosting the modules. */
  host?: SdkHostKind
  children: React.ReactNode
}

function useSdkStorageImpl(): SdkStorage {
  const runtime = useRuntime()
  return useMemo<SdkStorage>(() => {
    const platformStorage = runtime.storage
    if (!platformStorage) return createLocalStorage()
    return {
      async get(key) {
        const value = await platformStorage.get<string>(key)
        return value ?? null
      },
      set: (key, value) => platformStorage.set(key, value),
      remove: (key) => platformStorage.remove(key),
    }
  }, [runtime])
}

export const RuntimeSdkProvider: React.FC<RuntimeSdkProviderProps> = ({
  host = "portal",
  children,
}) => {
  const runtime = useRuntime()
  const navigate = useNavigate()
  const location = useLocation()
  const api = useApiClient()
  const safeArea = useSafeArea()
  const runtimeTheme = useRuntimeTheme()
  const { authState, user } = useAuthState()
  const storage = useSdkStorageImpl()

  // Стек обработчиков кнопки «назад»: один на приложение, подписка на хост
  // тоже одна. Пересоздаётся только со сменой рантайма, то есть практически никогда —
  // модули регистрируются в него через sdk.backButton.
  const backButtonStack = useMemo(
    () => createBackButtonStack(runtime.backButton),
    [runtime]
  )
  useEffect(() => () => backButtonStack.dispose(), [backButtonStack])

  // Отдельная памятка, а не поле внутри общего useMemo ниже: тот пересчитывается на каждой
  // навигации (в его зависимостях `location`), и экраны переподписывались бы на кнопку при
  // каждом переходе — лишняя работа и лишний повод перепутать порядок в стеке.
  const backButton = useMemo<SdkBackButton>(
    () => ({
      isSupported: () => backButtonStack.isSupported(),
      register: (handler) => backButtonStack.register(handler),
    }),
    [backButtonStack]
  )

  const identity = useMemo(
    () => readPlatformIdentity(runtime.host),
    [runtime.host]
  )

  const sdkUser = useMemo<SdkUser>(
    () => ({
      isAuthenticated: authState === "authenticated",
      id: user?.id ?? null,
      platformUserId: identity.platformUserId,
      platform: identity.platform,
      firstName: user?.firstName ?? identity.firstName,
      lastName: user?.lastName ?? identity.lastName ?? null,
      roles: user?.roles ?? [],
    }),
    [authState, user, identity]
  )

  const environment = useMemo<SdkEnvironment>(
    () => ({
      host,
      platform: identity.platform,
      theme: runtimeTheme.scheme === "dark" ? "dark" : "light",
      safeArea: {
        top: safeArea.top,
        right: safeArea.right,
        bottom: safeArea.bottom,
        left: safeArea.left,
      },
      isDev: Boolean(import.meta.env?.DEV),
      isMock: false,
    }),
    [host, identity.platform, runtimeTheme.scheme, safeArea]
  )

  // `location` is a dependency on purpose: currentPath() must not go stale.
  const sdk = useMemo<ModuleSdk>(
    () => ({
      contractVersion: CONTRACT_VERSION,
      user: sdkUser,
      api,
      createApiClient: ({ baseUrl, timeout }) =>
        createApiClient({ baseUrl, timeout }),
      navigation: {
        navigate: (to, options) => navigate(to, { replace: options?.replace }),
        back: () => navigate(-1),
        currentPath: () => location.pathname + location.search,
        buildLink: (path) =>
          typeof window !== "undefined"
            ? new URL(path, window.location.origin).toString()
            : path,
      },
      environment,
      storage,
      config: portalConfig,
      screen: runtime.native.screen,
      qrScanner: runtime.native.qrScanner,
      haptics: {
        vibrate: runtime.native.vibrate,
        notify: runtime.native.hapticFeedback,
      },
      backButton,
      // TEMPORARY — see the contract note on ModuleSdk.unstable_getInitData.
      // Read lazily rather than captured: the messenger may populate its
      // WebApp object after the provider first renders.
      unstable_getInitData: () => getInitData(environment.platform),
    }),
    [sdkUser, api, environment, storage, navigate, location, runtime, backButton]
  )

  return <ModuleSdkProvider sdk={sdk}>{children}</ModuleSdkProvider>
}
