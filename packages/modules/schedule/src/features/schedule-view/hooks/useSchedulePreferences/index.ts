import { create } from "zustand"
import { tryGetSdk } from "@portal/module-sdk"
import { schedulePreferencesApi } from "../../api/schedulePreferencesApi"
import type { FavoriteItem, ScheduleOwnerType } from "../../features/day-lessons/types/ui"

/**
 * Platform user id, straight from the SDK.
 *
 * `tryGetSdk` rather than `getSdk`: this store can be touched before the host
 * finished mounting, and "no user yet" already has a defined meaning here —
 * preferences fall back to local persistence.
 */
function getPlatformUserId(): string | null {
  return tryGetSdk()?.user.platformUserId ?? null
}

export interface DefaultSchedule {
  type: ScheduleOwnerType
  id: string
  view: "day" | "session"
  query: string | null
  name: string
}

// Without a platform user (a plain browser, the DevKit, a guest) there is
// nothing to key server-side preferences on, so favorites and the default
// schedule are persisted locally instead. The UI behaves identically.
const DEFAULT_SCHEDULE_STORAGE_KEY = "default-schedule"
const FAVORITES_STORAGE_KEY = "schedule-favorites"

function readLocalFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY)
    const data = raw ? JSON.parse(raw) : []
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function writeLocalFavorites(favorites: FavoriteItem[]): void {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
  } catch {
    // ignore
  }
}

function readLocalDefaultSchedule(): DefaultSchedule | null {
  try {
    const raw = localStorage.getItem(DEFAULT_SCHEDULE_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data?.type || !data?.id || !data?.view) return null
    return {
      type: data.type,
      id: data.id,
      name: data.name ?? data.id,
      view: data.view,
      query: data.query ?? null,
    }
  } catch {
    return null
  }
}

function writeLocalDefaultSchedule(schedule: DefaultSchedule | null): void {
  try {
    if (schedule) {
      localStorage.setItem(DEFAULT_SCHEDULE_STORAGE_KEY, JSON.stringify(schedule))
    } else {
      localStorage.removeItem(DEFAULT_SCHEDULE_STORAGE_KEY)
    }
  } catch {
    // ignore
  }
}

interface PreferencesState {
  favorites: FavoriteItem[]
  defaultSchedule: DefaultSchedule | null
  loaded: boolean

  load: () => Promise<void>
  addFavorite: (target: {
    type: ScheduleOwnerType
    id: string
    name: string
  }) => Promise<void>
  removeFavorite: (type: ScheduleOwnerType, id: string) => Promise<void>
  toggleFavorite: (target: {
    type: ScheduleOwnerType
    id: string
    name: string
  }) => Promise<void>
  setDefault: (target: {
    type: ScheduleOwnerType
    id: string
    name: string
    view: "day" | "session"
    query?: string | null
  }) => Promise<void>
  clearDefault: () => Promise<void>
  isFavorite: (type: ScheduleOwnerType, id: string) => boolean
}

export const useSchedulePreferences = create<PreferencesState>((set, get) => ({
  favorites: [],
  defaultSchedule: null,
  loaded: false,

  load: async () => {
    const userId = getPlatformUserId()
    if (!userId) {
      // No platform user (e.g. browser/dev) — read local-only persistence
      set({
        favorites: readLocalFavorites(),
        defaultSchedule: readLocalDefaultSchedule(),
        loaded: true,
      })
      return
    }
    try {
      const prefs = await schedulePreferencesApi.getPreferences(userId)

      const favorites: FavoriteItem[] = prefs.favorites.map((f) => ({
        id: f.target.external_id,
        title: f.target.name,
        type: f.target.type as ScheduleOwnerType,
      }))

      const defaultSchedule: DefaultSchedule | null = prefs.default_schedule
        ? {
            type: prefs.default_schedule.target.type as ScheduleOwnerType,
            id: prefs.default_schedule.target.external_id,
            name: prefs.default_schedule.target.name,
            view: (prefs.default_schedule.view as "day" | "session") ?? "day",
            query: prefs.default_schedule.query,
          }
        : null

      set({ favorites, defaultSchedule, loaded: true })
    } catch {
      set({ loaded: true })
    }
  },

  addFavorite: async ({ type, id, name }) => {
    const userId = getPlatformUserId()
    if (!userId) {
      set((s) => {
        if (s.favorites.some((f) => f.id === id && f.type === type)) return s
        const favorites = [...s.favorites, { id, title: name, type }]
        writeLocalFavorites(favorites)
        return { favorites }
      })
      return
    }
    try {
      await schedulePreferencesApi.addFavorite(userId, {
        target_type: type,
        external_id: id,
        target_name: name,
      })
      set((s) => ({
        favorites: s.favorites.some((f) => f.id === id && f.type === type)
          ? s.favorites
          : [...s.favorites, { id, title: name, type }],
      }))
    } catch (e) {
      console.error("Failed to add favorite", e)
    }
  },

  removeFavorite: async (type, id) => {
    const userId = getPlatformUserId()
    if (!userId) {
      set((s) => {
        const favorites = s.favorites.filter((f) => !(f.id === id && f.type === type))
        writeLocalFavorites(favorites)
        return { favorites }
      })
      return
    }
    try {
      await schedulePreferencesApi.removeFavorite(userId, type, id)
      set((s) => ({
        favorites: s.favorites.filter((f) => !(f.id === id && f.type === type)),
      }))
    } catch (e) {
      console.error("Failed to remove favorite", e)
    }
  },

  toggleFavorite: async ({ type, id, name }) => {
    const { isFavorite, addFavorite, removeFavorite } = get()
    if (isFavorite(type, id)) {
      await removeFavorite(type, id)
    } else {
      await addFavorite({ type, id, name })
    }
  },

  setDefault: async ({ type, id, name, view, query }) => {
    const userId = getPlatformUserId()
    const defaultSchedule: DefaultSchedule = { type, id, name, view, query: query ?? null }

    if (!userId) {
      // No platform user — persist locally only, nothing to sync to backend
      set({ defaultSchedule })
      writeLocalDefaultSchedule(defaultSchedule)
      return
    }

    try {
      await schedulePreferencesApi.setDefault(userId, {
        target_type: type,
        external_id: id,
        target_name: name,
        view,
        query,
      })
      set({ defaultSchedule })
      // Keep localStorage in sync for immediate redirect on next load
      writeLocalDefaultSchedule(defaultSchedule)
    } catch (e) {
      console.error("Failed to set default schedule", e)
      // Fall back to localStorage-only
      writeLocalDefaultSchedule(defaultSchedule)
    }
  },

  clearDefault: async () => {
    const userId = getPlatformUserId()

    if (!userId) {
      set({ defaultSchedule: null })
      writeLocalDefaultSchedule(null)
      return
    }

    try {
      await schedulePreferencesApi.clearDefault(userId)
    } catch (e) {
      console.error("Failed to clear default schedule", e)
    }
    set({ defaultSchedule: null })
    writeLocalDefaultSchedule(null)
  },

  isFavorite: (type, id) => {
    return get().favorites.some((f) => f.id === id && f.type === type)
  },
}))
