import type { Meta, StoryObj } from "@storybook/react"
import Section from "./Section"

const meta: Meta<typeof Section> = {
  title: "Layout/Section",
  component: Section,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof Section>

export const Default: Story = {
  args: {
    title: "Заголовок секции",
    children: (
      <div style={{ padding: "0 1.5rem" }}>
        <p>Содержимое секции. Здесь может быть любой контент.</p>
        <p>Например, несколько параграфов текста.</p>
      </div>
    ),
  },
}

export const WithControlText: Story = {
  args: {
    title: "Расписание на сегодня",
    controlText: "Показать все",
    onControlClick: () => alert("Показать все занятия"),
    children: (
      <div style={{ padding: "0 1.5rem" }}>
        <p>9:00 - Математика</p>
        <p>10:45 - Физика</p>
        <p>12:30 - Программирование</p>
      </div>
    ),
  },
}

export const Collapsible: Story = {
  args: {
    title: "Сворачиваемая секция",
    collapsible: true,
    defaultExpanded: true,
    children: (
      <div style={{ padding: "0 1.5rem" }}>
        <p>Это содержимое можно свернуть, нажав на стрелку в заголовке.</p>
        <p>Попробуйте нажать на иконку стрелки!</p>
      </div>
    ),
  },
}

export const CollapsibleClosed: Story = {
  args: {
    title: "Свернутая секция",
    collapsible: true,
    defaultExpanded: false,
    children: (
      <div style={{ padding: "0 1.5rem" }}>
        <p>Эта секция свернута по умолчанию.</p>
        <p>Нажмите на стрелку, чтобы развернуть.</p>
      </div>
    ),
  },
}

export const WithCustomBackground: Story = {
  args: {
    title: "Секция с фоном",
    background: "rgba(0, 122, 255, 0.1)",
    children: (
      <div style={{ padding: "0 1.5rem" }}>
        <p>Эта секция имеет кастомный цвет фона.</p>
      </div>
    ),
  },
}

export const WideContent: Story = {
  args: {
    title: "Секция с широким контентом",
    isContentWide: true,
    children: (
      <div style={{ backgroundColor: "#f0f0f0", padding: "16px" }}>
        <p>Контент занимает всю ширину без боковых отступов.</p>
        <p>Полезно для списков, карточек и других элементов.</p>
      </div>
    ),
  },
}

export const ComplexExample: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Section title="О комбинате питания">
        <div style={{ padding: "0 1.5rem" }}>
          <p>Комбинат питания ОГУ - это современная сеть столовых и кафе.</p>
        </div>
      </Section>

      <Section title="Точки питания" collapsible defaultExpanded={true}>
        <div style={{ padding: "0 1.5rem" }}>
          <ul>
            <li>Столовая №1 (Главный корпус)</li>
            <li>Столовая №2 (1 корпус)</li>
            <li>Кафе "Студенческое"</li>
          </ul>
        </div>
      </Section>

      <Section
        title="Меню"
        controlText="Посмотреть"
        onControlClick={() => alert("Открыть меню")}
      >
        <div style={{ padding: "0 1.5rem" }}>
          <p>Ежедневное меню с разнообразными блюдами.</p>
        </div>
      </Section>
    </div>
  ),
}
