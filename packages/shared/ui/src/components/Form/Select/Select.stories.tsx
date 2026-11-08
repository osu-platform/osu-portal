import type { Meta, StoryObj } from "@storybook/react"
import type { ReactNode } from "react"

import { List } from "components/Blocks/List/List"
import { Select, SelectProps } from "./Select"

const meta = {
  title: "Form/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Select>

export default meta

const basicOptions = [
  { value: "hello", label: "Hello" },
  { value: "okay", label: "Okay" },
]

const longOptions = Array.from({ length: 30 }, (_, index) => ({
  value: `item-${index + 1}`,
  label: `Option ${index + 1}`,
}))

const longLabelOptions = [
  {
    value: "long-1",
    label:
      "Very long option name that should be truncated gracefully in the dropdown list",
  },
  {
    value: "long-2",
    label:
      "Another extra long label to validate scrolling and text overflow behavior",
  },
]

const Wrapper = ({ children }: { children: ReactNode }) => (
  <List
    style={{
      width: 260,
      background: "var(--p-color-bg-secondary)",
    }}
  >
    {children}
  </List>
)

export const Playground: StoryObj<SelectProps> = {
  render: () => (
    <Wrapper>
      <Select
        header="Select"
        placeholder="Choose option"
        options={basicOptions}
      />
    </Wrapper>
  ),
}

export const SearchDisabled: StoryObj<SelectProps> = {
  render: () => (
    <Wrapper>
      <Select
        header="No Search"
        placeholder="Pick one"
        options={basicOptions}
        searchable={false}
      />
    </Wrapper>
  ),
}

export const EmptyList: StoryObj<SelectProps> = {
  render: () => (
    <Wrapper>
      <Select
        header="Empty"
        placeholder="Nothing to select"
        options={[]}
        emptyText="No options"
      />
    </Wrapper>
  ),
}

export const LongList: StoryObj<SelectProps> = {
  render: () => (
    <Wrapper>
      <Select
        header="Long List"
        placeholder="Scroll to select"
        options={longOptions}
      />
    </Wrapper>
  ),
}

export const LongLabels: StoryObj<SelectProps> = {
  render: () => (
    <Wrapper>
      <Select
        header="Long Labels"
        placeholder="Select"
        options={longLabelOptions}
      />
    </Wrapper>
  ),
}
