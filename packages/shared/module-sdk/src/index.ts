/**
 * @portal/module-sdk
 *
 * The versioned contract between a module and the platform.
 * See src/types.ts for the surface and docs/MODULE_GUIDE.md for usage.
 */

export type {
  ModuleSdk,
  SdkUser,
  SdkNavigation,
  SdkEnvironment,
  SdkStorage,
  SdkSafeArea,
  SdkPlatform,
  SdkHostKind,
  SdkThemeMode,
  SdkScreen,
  SdkQrScanner,
  SdkQrScanResult,
  SdkHaptics,
  SdkBackButton,
} from "./types"

export {
  ModuleSdkProvider,
  useSdk,
  useSdkUser,
  useSdkApi,
  useSdkNavigation,
  useSdkEnvironment,
  useSdkStorage,
  useSdkConfig,
  getSdk,
  tryGetSdk,
  setSdk,
  getModuleApiClient,
  useSdkBackHandler,
  useSdkHasBackButton,
} from "./context"
export type { ModuleSdkProviderProps } from "./context"

export {
  namespaceStorage,
  createLocalStorage,
  createMemoryStorage,
} from "./storage"

export {
  CONTRACT_VERSION,
  checkContractCompatibility,
  parseSemVer,
} from "./version"
export type { CompatibilityResult, SemVer } from "./version"
