import { useEffect } from "react"
import { controller } from "./lib"
import { clearOnboardingStorage } from "./storage"

const PRESET = "scheduleFirstVisit"
const SHOWN_KEY = "portal.schedule.onboarding.shown"
const START_DELAY_MS = 800

let started = false

export async function resetOnboarding() {
  started = false
  clearOnboardingStorage()
  await controller.setOnboardingEnabled(true)
  await controller.addPreset(PRESET)
  await controller.runPreset(PRESET)
}

export function useScheduleOnboarding(ready: boolean) {
  useEffect(() => {
    console.log("[schedule onboarding] effect", { ready, started, shown: localStorage.getItem(SHOWN_KEY) })
    if (!ready) return
    if (started) { console.log("[schedule onboarding] skip: already started"); return }
    if (localStorage.getItem(SHOWN_KEY) === "1") { console.log("[schedule onboarding] skip: already shown"); return }
    started = true

    const timer = setTimeout(async () => {
      try {
        await controller.setOnboardingEnabled(true)
        await controller.addPreset(PRESET)
        const ran = await controller.runPreset(PRESET)
        console.log("[schedule onboarding] runPreset →", ran, controller.state)
      } catch (e) {
        console.error("[schedule onboarding] failed to start", e)
      }
    }, START_DELAY_MS)

    return () => clearTimeout(timer)
  }, [ready])
}

export function markOnboardingShown() {
  localStorage.setItem(SHOWN_KEY, "1")
}
