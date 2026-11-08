import styles from "./Placeholder.stories.module.css"

import type { Meta, StoryObj } from "@storybook/react"
import { hideControls, setControlsTypes } from "storybook/controls"

import { Button } from "components"
import { Placeholder } from "./Placeholder"

const meta = {
  title: "Blocks/Placeholder",
  component: Placeholder,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    ...hideControls("children", "action"),
    ...setControlsTypes(["header", "description"], "text"),
  },
} satisfies Meta<typeof Placeholder>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    children: (
      <img
        alt="Telegram sticker"
        src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22120%22%20height%3D%2280%22%3E%3Crect%20width%3D%22120%22%20height%3D%2280%22%20fill%3D%22%23dae8fa%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2240%22%20r%3D%2220%22%20fill%3D%22%23426da9%22%2F%3E%3C%2Fsvg%3E"
        className={styles.sticker}
      />
    ),
    header: "Title",
    description: "Description",
  },
  render: (args) => (
    <div className={styles.placeholderWrapper}>
      <Placeholder {...args} />
    </div>
  ),
} satisfies Story

export const WithAction: Story = {
  args: {
    ...Playground.args,
    action: (
      <Button stretched size="l">
        Action
      </Button>
    ),
  },
  render: Playground.render,
} satisfies Story

export const HeaderAndDescription: Story = {
  args: {
    children: Playground.args?.children,
    description:
      "Only you can see archived stories unless you choose to post them to your profile.",
  },
  render: Playground.render,
}
