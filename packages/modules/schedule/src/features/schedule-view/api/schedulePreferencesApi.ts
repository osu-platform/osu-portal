import { getModuleApiClient, getSdk } from "@portal/module-sdk"

/**
 * The schedule backend, reached through the SDK.
 *
 * Lazy on purpose: the client must be created after the host installed its SDK
 * implementation, so that the DevKit's offline mock can intercept these calls.
 */
const http = () => getModuleApiClient(getSdk().config.scheduleApiUrl)

/** The platform we are embedded in — supplied by the host, never assumed. */
const platform = () => getSdk().user.platform

export interface TargetRead {
  id: number
  type: string
  external_id: string
  name: string
}

export interface FavoriteRead {
  id: number
  target: TargetRead
  created_at: string
}

export interface DefaultScheduleRead {
  target: TargetRead
  view: string
  query: string | null
  created_at: string
  updated_at: string
}

export interface UserPreferencesRead {
  default_schedule: DefaultScheduleRead | null
  favorites: FavoriteRead[]
}

export const schedulePreferencesApi = {
  async getPreferences(platformUserId: string): Promise<UserPreferencesRead> {
    const { data } = await http().get<UserPreferencesRead>(
      "/api/v1/preferences",
      {
        params: { platform: platform(), platform_user_id: platformUserId },
      }
    )
    return data
  },

  async setDefault(
    platformUserId: string,
    payload: {
      target_type: string
      external_id: string
      target_name: string
      view: string
      query?: string | null
    }
  ): Promise<DefaultScheduleRead> {
    const { data } = await http().put<DefaultScheduleRead>(
      "/api/v1/preferences/default",
      {
        platform: platform(),
        platform_user_id: platformUserId,
        ...payload,
      }
    )
    return data
  },

  async clearDefault(platformUserId: string): Promise<void> {
    await http().delete("/api/v1/preferences/default", {
      params: { platform: platform(), platform_user_id: platformUserId },
    })
  },

  async addFavorite(
    platformUserId: string,
    payload: { target_type: string; external_id: string; target_name: string }
  ): Promise<FavoriteRead> {
    const { data } = await http().post<FavoriteRead>(
      "/api/v1/preferences/favorites",
      {
        platform: platform(),
        platform_user_id: platformUserId,
        ...payload,
      }
    )
    return data
  },

  async removeFavorite(
    platformUserId: string,
    targetType: string,
    externalId: string
  ): Promise<void> {
    await http().delete(
      `/api/v1/preferences/favorites/${targetType}/${externalId}`,
      {
        params: { platform: platform(), platform_user_id: platformUserId },
      }
    )
  },
}
