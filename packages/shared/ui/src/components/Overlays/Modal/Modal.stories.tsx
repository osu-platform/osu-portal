import { useState } from "react"

import { Decorator, Meta, StoryObj } from "@storybook/react"
import { Icon28Close } from "icons/28/close"
import { hideControls } from "storybook/controls"

import { Button, Placeholder } from "components"
import { Modal, ModalProps } from "./Modal"

const meta = {
  title: "Overlays/Modal",
  component: Modal,
  argTypes: hideControls(
    "header",
    "trigger",
    "children",
    "overlayComponent",
    "snapPoints",
    "fadeFromIndex"
  ),
} satisfies Meta<typeof Modal>

export default meta

type Story = StoryObj<typeof meta>

const DecoratorFullScreen: Decorator = (StoryComponent) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: 600,
      maxHeight: "96vh",
    }}
  >
    <StoryComponent />
  </div>
)

export const Playground: Story = {
  args: {
    header: <Modal.Header>Only iOS header</Modal.Header>,
    trigger: <Button size="m">Open modal</Button>,
    children: (
      <Placeholder header="Title" description="Description">
        <img
          alt="Telegram sticker"
          src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22120%22%20height%3D%2280%22%3E%3Crect%20width%3D%22120%22%20height%3D%2280%22%20fill%3D%22%23dae8fa%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2240%22%20r%3D%2220%22%20fill%3D%22%23426da9%22%2F%3E%3C%2Fsvg%3E"
          style={{ display: "block", width: "144px", height: "144px" }}
        />
      </Placeholder>
    ),
  },
  decorators: [DecoratorFullScreen],
}

const PlaceholderForNestedModal = (props: ModalProps) => (
  <Placeholder
    header="Title"
    description="Description"
    action={
      <Modal {...props} nested>
        <PlaceholderForNestedModal {...props} />
      </Modal>
    }
  />
)

export const NestedModals: Story = {
  args: Playground.args,
  render: (args) => (
    <Modal {...args}>
      <PlaceholderForNestedModal trigger={args.trigger} {...args} />
    </Modal>
  ),
  decorators: [DecoratorFullScreen],
}

export const WithCloseButton: Story = {
  args: {
    ...Playground.args,
    header: (
      <Modal.Header
        after={
          <Modal.Close>
            <Icon28Close style={{ color: "var(--p-color-text-primary)" }} />
          </Modal.Close>
        }
      >
        Only iOS header
      </Modal.Header>
    ),
  },
  decorators: [DecoratorFullScreen],
}

export const SnapPoints: Story = {
  args: {
    ...Playground.args,
    snapPoints: [0.33, 0.66, 1],
    children: (
      <>
        <div style={{ height: "33vh", background: "blue" }} />
        <div style={{ height: "33vh", background: "green" }} />
        <div style={{ height: "33vh", background: "bisque" }} />
      </>
    ),
  },
  decorators: [DecoratorFullScreen],
}

export const Controlled: Story = {
  args: {
    ...Playground.args,
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(args.open)
    const [isFetching, setIsFetching] = useState(false)

    const fetchAndClose = () => {
      setIsFetching(true)
      setTimeout(() => {
        setIsFetching(false)
        setIsOpen(false)
      }, 1000)
    }

    return (
      <Placeholder
        header="This modal will be closed after 1000ms, click fetch"
        description="Click fetch"
        action={
          <Button size="m" onClick={() => setIsOpen(true)}>
            Open again
          </Button>
        }
      >
        <Modal
          {...args}
          trigger={undefined}
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <Placeholder
            action={
              <Button size="m" loading={isFetching} onClick={fetchAndClose}>
                Fetch data and close
              </Button>
            }
          />
        </Modal>
      </Placeholder>
    )
  },
  decorators: [DecoratorFullScreen],
}
