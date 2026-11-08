import { JSX } from "react"
import type { IModule } from "@portal/shared-module-types"

export interface IWidgets extends Record<string, () => JSX.Element> {
  dashboardWidget: () => JSX.Element
}

export type IRoutes = React.ReactNode

export interface IScheduleService {
  getLessonsForToday(userId: string): Lesson[]
}

export interface Lesson {
  id: string
  title: string
  time: string
}

export interface IScheduleModule extends IModule {
  service: IScheduleService
  widgets: IWidgets
}
