import type { Meta, StoryObj } from "@storybook/react"
import { Icon12Quote } from "icons/12/quote"
import { Icon28Stats } from "icons/28/stats"
import { hideControls } from "storybook/controls"

import { Avatar } from "./Avatar"

const meta = {
  title: "Blocks/Avatar",
  component: Avatar,
  argTypes: hideControls("fallbackIcon", "children"),
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const ValidImage: Story = {
  args: {
    size: 96,
    src: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22120%22%20height%3D%2280%22%3E%3Crect%20width%3D%22120%22%20height%3D%2280%22%20fill%3D%22%23dae8fa%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2240%22%20r%3D%2220%22%20fill%3D%22%23426da9%22%2F%3E%3C%2Fsvg%3E",
  },
} satisfies Story

export const InvalidImage: Story = {
  args: {
    size: 96,
    src: "https://avatars.gitontent.com/u/84640980?v=4",
  },
} satisfies Story

export const WithFallback: Story = {
  args: {
    size: 96,
    src: "https://avatars.gitontent.com/u/84640980?v=4",
    fallbackIcon: <span>😕</span>,
  },
} satisfies Story

export const WithBadge: Story = {
  args: {
    size: 48,
    src: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22120%22%20height%3D%2280%22%3E%3Crect%20width%3D%22120%22%20height%3D%2280%22%20fill%3D%22%23dae8fa%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2240%22%20r%3D%2220%22%20fill%3D%22%23426da9%22%2F%3E%3C%2Fsvg%3E",
    fallbackIcon: <span>😕</span>,
    children: (
      <Avatar.Badge type="number" large>
        42
      </Avatar.Badge>
    ),
  },
} satisfies Story

export const WithAcronym: Story = {
  args: {
    size: 96,
    acronym: "IS",
  },
} satisfies Story

export const WithChildren: Story = {
  args: {
    size: 48,
    children: <Icon28Stats />,
  },
  render: (props) => (
    <Avatar {...props}>
      {(props?.size || 0) <= 28 ? <Icon12Quote /> : <Icon28Stats />}
    </Avatar>
  ),
} satisfies Story
