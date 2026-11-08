const STATE_KEY = "portal.schedule.onboarding.state"
const PROGRESS_KEY = "portal.schedule.onboarding.progress"

function readJSON<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : undefined
  } catch {
    return undefined
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota / privacy mode errors
  }
}

export const loadOnboardingState = () => readJSON(STATE_KEY)
export const loadProgressState = () => readJSON(PROGRESS_KEY)
export const saveOnboardingState = (state: unknown) => writeJSON(STATE_KEY, state)
export const saveProgressState = (progress: unknown) =>
  writeJSON(PROGRESS_KEY, progress)

export function clearOnboardingStorage() {
  const SHOWN_KEY = "portal.schedule.onboarding.shown"
  localStorage.removeItem(SHOWN_KEY)
  localStorage.removeItem(STATE_KEY)
  localStorage.removeItem(PROGRESS_KEY)
}
