/// <reference types="vite/client" />

declare const __GIT_HASH__: string
declare const __BUILD_DATE__: string
declare const __SLICE_VERSION__: string

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string
  readonly VITE_DATA_PROFILE?: "mock" | "live"
  readonly VITE_DEV_DASHBOARD?: string
  readonly VITE_MODULE_ENTRY?: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
