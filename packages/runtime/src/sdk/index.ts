/**
 * @portal/runtime/sdk
 *
 * Runtime-backed implementation of the @portal/module-sdk contract.
 */

export { RuntimeSdkProvider } from "./RuntimeSdkProvider"
export type { RuntimeSdkProviderProps } from "./RuntimeSdkProvider"
export { readPlatformIdentity, hostTypeToPlatform } from "./platformUser"
export type { PlatformIdentity } from "./platformUser"
