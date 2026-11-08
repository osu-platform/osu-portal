import type { Meta, StoryObj } from "@storybook/react"
import { hideControls, setControlsTypes } from "storybook/controls"

import { Button } from "components"
import { Image as UIImage } from "components/Blocks/Image/Image"
import { List } from "components/Blocks/List/List"
import { Banner } from "./Banner"

const meta = {
  title: "Blocks/Banner",
  component: Banner,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    ...hideControls("before", "children", "onCloseIcon", "background"),
    ...setControlsTypes(["header", "subheader", "description"], "text"),
  },
} satisfies Meta<typeof Banner>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    type: "section",
    before: <UIImage size={48} />,
    callout: "Urgent notification",
    header: "Introducing TON Space",
    description: "Start exploring TON in a new, better way",
    children: (
      <>
        <Button size="s">Try it out</Button>
        <Button size="s" mode="plain">
          Maybe later
        </Button>
      </>
    ),
    onCloseIcon: () => console.log("onCloseIcon"),
  },
  decorators: [
    (StoryComponent) => (
      <List style={{ background: "var(--p-color-bg-secondary)" }}>
        <StoryComponent />
      </List>
    ),
  ],
} satisfies Story

export const Image: Story = {
  args: {
    type: "section",
    header: "Introducing TON Space",
    subheader: "Start exploring TON in a new, better way",
    background: (
      <img
        alt="Nasa streams"
        style={{ width: "150%" }}
        src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22120%22%20height%3D%2280%22%3E%3Crect%20width%3D%22120%22%20height%3D%2280%22%20fill%3D%22%23dae8fa%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2240%22%20r%3D%2220%22%20fill%3D%22%23426da9%22%2F%3E%3C%2Fsvg%3E"
      />
    ),
    children: (
      <Button size="s" mode="white">
        Try it out
      </Button>
    ),
  },
  decorators: [
    (StoryComponent) => (
      <List style={{ background: "var(--p-color-bg-secondary)" }}>
        <StoryComponent />
      </List>
    ),
  ],
} satisfies Story
