import type { Meta, StoryObj } from "@storybook/react"
import { hideControls } from "storybook/controls"

import { Avatar, AvatarProps } from "components/Blocks/Avatar/Avatar"
import { AvatarStack } from "./AvatarStack"

const AVATAR_URL = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22120%22%20height%3D%2280%22%3E%3Crect%20width%3D%22120%22%20height%3D%2280%22%20fill%3D%22%23dae8fa%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2240%22%20r%3D%2220%22%20fill%3D%22%23426da9%22%2F%3E%3C%2Fsvg%3E"

const meta = {
  title: "Blocks/AvatarStack",
  component: AvatarStack,
  argTypes: hideControls("children"),
} satisfies Meta<typeof AvatarStack>

export default meta

export const Playground: StoryObj<AvatarProps> = {
  args: {
    children: (
      <>
        <Avatar size={48} src={AVATAR_URL} />
        <Avatar size={48} src={AVATAR_URL} />
        <Avatar size={48} src={AVATAR_URL} />
        <Avatar size={48} src={AVATAR_URL} />
      </>
    ),
  },
}
