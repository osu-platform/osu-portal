import type { Meta, StoryObj } from "@storybook/react-vite"
import { ScheduleWidget } from "../widgets/ScheduleWidget"

const meta = {
  title: "Schedule/Widget",
  component: ScheduleWidget,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ScheduleWidget>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
