import type { Meta, StoryObj } from "@storybook/react-vite"
import { ClassDetailsModal } from "../features/schedule-view/features/day-lessons/ui/view/ClassDetailsModal"
import { SelectScheduleModal } from "../features/schedule-view/ui/select/SelectScheduleModal"
import {
  mockFavorites,
  mockScheduleItems,
  mockSelectionOptions,
} from "../mocks/scheduleMocks"

const meta = {
  title: "Schedule/Modals",
  parameters: {
    layout: "centered",
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const ClassDetails: Story = {
  render: () => (
    <ClassDetailsModal
      open
      onOpenChange={() => undefined}
      item={mockScheduleItems[0]}
    />
  ),
}

export const SelectSchedule: Story = {
  render: () => (
    <SelectScheduleModal
      open
      onOpenChange={() => undefined}
      favorites={mockFavorites}
      options={mockSelectionOptions}
      active="group"
      onActiveChange={() => undefined}
      group={{}}
      onGroupChange={() => undefined}
      teacher={{}}
      onTeacherChange={() => undefined}
      audience={{}}
      onAudienceChange={() => undefined}
      onConfirm={() => undefined}
      setScheduleTitle={() => undefined}
    />
  ),
}
