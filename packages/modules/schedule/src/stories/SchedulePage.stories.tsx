import type { Meta, StoryObj } from "@storybook/react-vite"
import { SchedulePage } from "../pages/SchedulePage"

const meta = {
  title: "Schedule/Page",
  component: SchedulePage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SchedulePage>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
