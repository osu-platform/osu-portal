import { createRef } from "react"
import {
  createOnboarding,
  createPreset,
  createStep,
} from "@gravity-ui/onboarding"

/** Ref на контейнер тултипа — исключается из click-outside в меню */
export const onboardingHintRef = createRef<HTMLDivElement>()
import {
  loadOnboardingState,
  loadProgressState,
  saveOnboardingState,
  saveProgressState,
} from "./storage"

export const {
  useOnboardingStep,
  useOnboardingHint,
  useOnboardingPresets,
  controller,
} = createOnboarding({
  config: {
    presets: {
      scheduleFirstVisit: createPreset({
        name: "Знакомство с расписанием",
        steps: [
          createStep({
            slug: "searchSchedule",
            name: "Найдите своё расписание",
            description: "Ищите по группе, преподавателю или аудитории.",
          }),
          createStep({
            slug: "openMenu",
            name: "Меню расписания",
            description:
              "Переключайте день/сессию, добавляйте в избранное и экспортируйте в календарь.",
          }),
          createStep({
            slug: "watchSchedule",
            name: "Следите за расписанием",
            description: "Получайте уведомления о занятиях.",
          }),
        ],
      }),
    },
  },
  baseState: loadOnboardingState() as any,
  getProgressState: async () => (loadProgressState() as any) ?? {},
  onSave: {
    state: async (state) => saveOnboardingState(state),
    progress: async (progress) => saveProgressState(progress),
  },
  debugMode: false,
})
