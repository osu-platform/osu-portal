import { CONTRACT_VERSION } from "@portal/module-sdk"
import { ScheduleWidget } from "."
import { IScheduleModule } from "../api/public"
import routes from "./routes"

export function createModule(): IScheduleModule {
  return {
    slug: "schedule",
    name: "Расписание",
    description: "Расписание занятий",
    icon: () => <span>📅</span>,
    visible: true,
    order: 20,
    version: "1.0.0",
    // The contract this module was written against. The host refuses to load
    // it if it cannot satisfy that contract — see @portal/module-sdk/version.
    contractVersion: CONTRACT_VERSION,

    service: {
      getLessonsForToday(_userId: string) {
        return []
      },
    },
    routes: routes,

    widgets: {
      dashboardWidget: () => <ScheduleWidget />,
    },

    init() {},
  }
}
