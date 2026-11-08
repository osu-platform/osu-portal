import React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import MaxButton from "./MaxButton"

const meta = {
  title: "Utilities/MaxButton",
  component: MaxButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    onClick: () => console.log("MAX button clicked"),
  },
} satisfies Meta<typeof MaxButton>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Основное состояние кнопки MAX авторизации
 */
export const Default: Story = {
  args: {
    label: "Войти через Max",
  },
}

/**
 * Кнопка в процессе загрузки
 */
export const Loading: Story = {
  args: {
    disabled: true,
    label: "Загрузка...",
  },
}

/**
 * Отключенная кнопка
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    label: "Войти через Max",
  },
}

/**
 * Кнопка во весь ширину контейнера
 */
export const FullWidth: Story = {
  args: {
    fullWidth: true,
    label: "Войти через Max",
  },
  render: (args) => (
    <div style={{ width: "300px" }}>
      <MaxButton {...args} />
    </div>
  ),
}

/**
 * Кнопка в мобильной сетке (как в Login)
 */
export const InAuthGrid: Story = {
  render: (args) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto",
        gap: "5px",
        justifyItems: "center",
        width: "280px",
      }}
    >
      <MaxButton {...args} />
    </div>
  ),
}

/**
 * Несколько кнопок в колонке (демонстрация вариантов)
 */
export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div>
        <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#666" }}>
          Default
        </p>
        <MaxButton label="Войти через Max" />
      </div>
      <div>
        <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#666" }}>
          Disabled
        </p>
        <MaxButton disabled label="Войти через Max" />
      </div>
      <div>
        <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#666" }}>
          Custom label
        </p>
        <MaxButton label="Авторизация MAX" />
      </div>
      <div>
        <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#666" }}>
          Full width
        </p>
        <MaxButton fullWidth label="Войти через Max" />
      </div>
    </div>
  ),
}

/**
 * Кнопка с обработчиком клика
 */
export const WithClickHandler: Story = {
  args: {
    onClick: () => alert("MAX авторизация была нажата!"),
    label: "Войти через Max",
  },
}

/**
 * Интерактивная демонстрация
 */
export const Interactive: Story = {
  render: function Render(args) {
    const [isLoading, setIsLoading] = React.useState(false)

    const handleClick = () => {
      setIsLoading(true)
      // Имитация задержки авторизации
      setTimeout(() => {
        setIsLoading(false)
        alert("Авторизация завершена!")
      }, 2000)
    }

    return (
      <MaxButton
        {...args}
        disabled={isLoading}
        label={isLoading ? "Загрузка..." : "Войти через Max"}
        onClick={handleClick}
      />
    )
  },
}
