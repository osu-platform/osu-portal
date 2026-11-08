import type { Meta, StoryObj } from "@storybook/react"
import { hideControls } from "storybook/controls"

import { Card } from "./Card"

const meta = {
  title: "Blocks/Card",
  component: Card,
  argTypes: hideControls("children"),
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    children: (
      <>
        <Card.Chip readOnly>Hot place</Card.Chip>
        <img
          alt="Dog"
          src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22120%22%20height%3D%2280%22%3E%3Crect%20width%3D%22120%22%20height%3D%2280%22%20fill%3D%22%23dae8fa%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2240%22%20r%3D%2220%22%20fill%3D%22%23426da9%22%2F%3E%3C%2Fsvg%3E"
          style={{
            display: "block",
            width: 254,
            height: 308,
            objectFit: "cover",
          }}
        />
        <Card.Cell readOnly subtitle="United states">
          New York
        </Card.Cell>
      </>
    ),
  },
} satisfies Story
