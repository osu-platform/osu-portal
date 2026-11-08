import type { Meta, StoryObj } from "@storybook/react-vite"
import { LessonSection } from "./LessonSection"
import { Channel, Lab, User } from "@portal/shared-assets"
import { Text } from "@portal/shared-ui"

const meta = {
  title: "Schedule/UI/LessonSection",
  component: LessonSection,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    mode: {
      control: "select",
      options: ["active", "past", "future", "skeleton"],
    },
    onClick: { action: "clicked" },
  },
} satisfies Meta<typeof LessonSection>

export default meta
type Story = StoryObj<typeof meta>

const MockDescription = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
    <Text>Группа БПИ201</Text>
    <Text>Аудитория 444</Text>
  </div>
)

const MockTeacherDescription = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
    <Text>Проф. Иванов И.И.</Text>
    <Text>Аудитория 302</Text>
  </div>
)

const mockTimeBlock = ["9:30", "11:10"]

export const Future: Story = {
  args: {
    icon: <Channel />,
    subtitle: "Лекционное занятие",
    title: "Введение в веб-дизайн",
    description: <MockDescription />,
    time: mockTimeBlock,
    mode: "future",
  },
}

export const Active: Story = {
  args: {
    icon: <Lab />,
    subtitle: "Лабораторная работа",
    title: "Практикум по React",
    description: <MockDescription />,
    time: mockTimeBlock,
    mode: "active",
  },
}

export const Past: Story = {
  args: {
    icon: <User />,
    subtitle: "Практическое занятие",
    title: "Семинар по архитектуре",
    description: <MockTeacherDescription />,
    time: mockTimeBlock,
    mode: "past",
  },
}

export const Skeleton: Story = {
  args: {
    mode: "skeleton",
  },
}

export const WithoutIcon: Story = {
  args: {
    subtitle: "Практическое занятие",
    title: "Обсуждение практик",
    description: <MockDescription />,
    number: "4",
    mode: "future",
  },
}

export const WithoutTime: Story = {
  args: {
    icon: <Channel />,
    subtitle: "Лекционное занятие",
    title: "История кино",
    description: <MockDescription />,
    mode: "future",
  },
}

export const WithoutSubtitle: Story = {
  args: {
    icon: <Lab />,
    title: "Лабораторная работа без типа",
    description: <MockDescription />,
    time: mockTimeBlock,
    mode: "future",
  },
}

export const WithoutDescription: Story = {
  args: {
    icon: <User />,
    subtitle: "Практическое занятие",
    title: "Сольная защита проекта",
    mode: "active",
  },
}

export const LongContent: Story = {
  args: {
    icon: <Channel />,
    subtitle: "Лекционное занятие",
    title:
      "Комплексный анализ архитектурных паттернов в масштабируемых распределённых системах",
    description: <MockDescription />,
    time: mockTimeBlock,
    mode: "future",
  },
}

export const AllSkeletons: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <LessonSection mode="skeleton" />
      <LessonSection mode="skeleton" />
      <LessonSection mode="skeleton" />
    </div>
  ),
}
