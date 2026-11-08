import { getModuleApiClient, getSdk } from "@portal/module-sdk"

/**
 * The schedule backend, reached through the SDK.
 *
 * Lazy on purpose: the client must be created after the host installed its SDK
 * implementation, so that the DevKit's offline mock can intercept these calls.
 */
const http = () => getModuleApiClient(getSdk().config.scheduleApiUrl)

export type NotificationType = "daily" | "before_lesson"
export type TargetType = "group" | "teacher"

export interface SubscriptionTarget {
  id: number
  type: TargetType
  external_id: string
  name: string
}

export interface Subscription {
  id: number
  target: SubscriptionTarget
  enabled: boolean
  notification_type: NotificationType
  daily_time: string | null // "HH:MM"
  before_minutes: number | null
  created_at: string
  updated_at: string
}

export interface CreateSubscriptionParams {
  platform: string
  platform_user_id: string
  target_type: TargetType
  external_id: string
  target_name: string
  notification_type: NotificationType
  daily_time?: string | null
  before_minutes?: number | null
}

export interface UpdateSubscriptionParams {
  enabled?: boolean
  daily_time?: string | null
  before_minutes?: number | null
}

export const subscriptionApi = {
  async list(platform: string, platformUserId: string): Promise<Subscription[]> {
    const res = await http().get<Subscription[]>("/api/v1/subscriptions", {
      params: { platform, platform_user_id: platformUserId },
    })
    return res.data
  },

  async create(params: CreateSubscriptionParams): Promise<Subscription> {
    const res = await http().post<Subscription>("/api/v1/subscriptions", params)
    return res.data
  },

  async update(id: number, params: UpdateSubscriptionParams): Promise<Subscription> {
    const res = await http().patch<Subscription>(`/api/v1/subscriptions/${id}`, params)
    return res.data
  },

  async delete(id: number): Promise<void> {
    await http().delete(`/api/v1/subscriptions/${id}`)
  },
}
