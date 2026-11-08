import type { Meta, StoryObj } from "@storybook/react"
import { Icon24SunLow } from "icons/24/sun_low"

import { IconContainer, List, Section } from "components"
import { Slider } from "./Slider"

const meta = {
  title: "Form/Slider",
  component: Slider,
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <List style={{ background: "var(--p-color-bg-secondary)" }}>
      <Section header="Slider" footer="Slider with no props">
        <Slider />
      </Section>
      <Section
        header="Slider with icons"
        footer="Slider with before and after props"
      >
        <Slider
          before={
            <IconContainer
              style={{ color: "var(--p-color-text-tertiary)" }}
            >
              <Icon24SunLow />
            </IconContainer>
          }
          after={
            <IconContainer>
              <Icon24SunLow />
            </IconContainer>
          }
        />
      </Section>
      <Section header="Stepped Slider" footer="Slider with step={20} prop">
        <Slider step={25} />
      </Section>
      <Section header="Range Slider" footer="Slider with multiple={true} prop">
        <Slider multiple />
      </Section>
      <Section
        header="Stepped Range Slider"
        footer="Slider with multiple={true},step={20} props"
      >
        <Slider step={20} multiple />
      </Section>
    </List>
  ),
} satisfies Story
