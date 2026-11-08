import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import AppleTabbar from "./AppleTabbar"
import { TabbarItem } from "../Tabbar/types"

// Mock icons (same as Tabbar stories)
const HomeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18.9433 8.38437C18.9433 10.2654 18.1615 11.9625 16.9171 13.1846C16.8507 13.2499 16.8155 13.3021 16.8001 13.3304C16.7746 15.2539 15.1766 16.7209 13.3159 16.7209H10.6845C8.82383 16.7209 7.22579 15.2539 7.20035 13.3304C7.18489 13.3021 7.14975 13.2499 7.0833 13.1846C5.83886 11.9625 5.05707 10.2654 5.05707 8.38437C5.05707 4.58161 8.21436 1.58586 12.0002 1.58586C15.786 1.58586 18.9433 4.58161 18.9433 8.38437Z"
      fill="currentColor"
    />
  </svg>
)

const ScheduleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.13904 2.1001C8.6361 2.1001 9.03904 2.50304 9.03904 3.0001V3.90316H15.7096V3.0001C15.7096 2.50304 16.1126 2.50304 16.6096 2.50304C17.1067 2.50304 17.5096 2.90598 17.5096 3.40304V3.98685C19.6552 4.40623 21.2743 6.29644 21.2743 8.56481V14.639C21.2743 15.7261 21.2743 16.5968 21.2168 17.3006C21.1578 18.0232 21.0337 18.6488 20.7403 19.2246C20.2705 20.1466 19.5209 20.8962 18.5989 21.366C18.023 21.6594 17.3975 21.7836 16.6748 21.8426C15.971 21.9001 15.1004 21.9001 14.0133 21.9001H10.7354C9.64831 21.9001 8.77763 21.9001 8.07385 21.8426C7.35119 21.7836 6.72563 21.6594 6.14978 21.366C5.22779 20.8962 4.47818 20.1466 4.0084 19.2246C3.715 18.6488 3.59086 18.0232 3.53182 17.3006C3.47432 16.5968 3.47433 15.7261 3.47433 14.639V10.5858Z"
      fill="currentColor"
    />
  </svg>
)

const ServicesIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" />
    <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" />
    <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" />
    <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" />
  </svg>
)

const ProfileIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle cx="12" cy="8" r="4" fill="currentColor" />
    <path
      d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
)

const mockItems: TabbarItem[] = [
  { id: "home", text: "Главная", icon: HomeIcon },
  { id: "schedule", text: "Расписание", icon: ScheduleIcon },
  { id: "services", text: "Сервисы", icon: ServicesIcon },
  { id: "profile", text: "Профиль", icon: ProfileIcon },
]

const meta: Meta<typeof AppleTabbar> = {
  title: "Navigation/AppleTabbar",
  component: AppleTabbar,
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "gradient",
      values: [
        {
          name: "gradient",
          value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        },
      ],
    },
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof AppleTabbar>

export const Default: Story = {
  args: {
    items: mockItems,
    activeId: "home",
    onItemClick: (id: string) => console.log("Clicked:", id),
  },
  decorators: [
    (Story: any) => (
      <div style={{ height: "100vh", position: "relative" }}>
        <div style={{ padding: "20px", color: "white" }}>
          <h1>Apple Tabbar with Glass Effect</h1>
          <p>Эффект стекла с размытием фона</p>
        </div>
        <Story />
      </div>
    ),
  ],
}

export const Interactive: Story = {
  render: () => {
    const [activeId, setActiveId] = useState("home")

    return (
      <div
        style={{
          height: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          position: "relative",
        }}
      >
        <div style={{ padding: "20px", color: "white" }}>
          <h2>Активная вкладка: {activeId}</h2>
          <p>Нажмите на вкладки внизу, чтобы изменить активную.</p>
          <div style={{ marginTop: "50px" }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <p key={i}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            ))}
          </div>
        </div>
        <AppleTabbar
          items={mockItems}
          activeId={activeId}
          onItemClick={setActiveId}
        />
      </div>
    )
  },
}

export const ThreeItems: Story = {
  args: {
    items: [
      { id: "home", text: "Главная", icon: HomeIcon },
      { id: "schedule", text: "Расписание", icon: ScheduleIcon },
      { id: "profile", text: "Профиль", icon: ProfileIcon },
    ],
    activeId: "schedule",
    onItemClick: (id: string) => console.log("Clicked:", id),
  },
  decorators: [
    (Story: any) => (
      <div
        style={{
          height: "100vh",
          background: "linear-gradient(to bottom, #ff9a9e 0%, #fad0c4 100%)",
          position: "relative",
        }}
      >
        <Story />
      </div>
    ),
  ],
}

export const LightTheme: Story = {
  args: {
    items: mockItems,
    activeId: "services",
    onItemClick: (id: string) => console.log("Clicked:", id),
  },
  decorators: [
    (Story: any) => (
      <div
        style={{
          height: "100vh",
          background: "linear-gradient(to bottom, #ffecd2 0%, #fcb69f 100%)",
          position: "relative",
        }}
      >
        <div style={{ padding: "20px", color: "#333" }}>
          <h2>Light Theme</h2>
          <p>Адаптация под светлую тему</p>
        </div>
        <Story />
      </div>
    ),
  ],
}

export const WithContent: Story = {
  render: () => {
    const [activeId, setActiveId] = useState("home")

    return (
      <div
        style={{
          height: "100vh",
          background:
            "url(data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22120%22%20height%3D%2280%22%3E%3Crect%20width%3D%22120%22%20height%3D%2280%22%20fill%3D%22%23dae8fa%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2240%22%20r%3D%2220%22%20fill%3D%22%23426da9%22%2F%3E%3C%2Fsvg%3E) center/cover",
          position: "relative",
          overflow: "auto",
        }}
      >
        <div
          style={{
            padding: "20px",
            color: "white",
            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
          }}
        >
          <h1>Расписание ОГУ</h1>
          <div
            style={{
              marginTop: "20px",
              background: "rgba(0,0,0,0.3)",
              padding: "20px",
              borderRadius: "12px",
            }}
          >
            <h3>Сегодня, 15 февраля</h3>
            <p>9:00 - Математический анализ</p>
            <p>10:45 - Программирование</p>
            <p>12:30 - Физика</p>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                marginTop: "20px",
                background: "rgba(255,255,255,0.2)",
                padding: "20px",
                borderRadius: "12px",
              }}
            >
              <h4>Секция {i + 1}</h4>
              <p>
                Содержимое секции для демонстрации прокрутки и эффекта размытия
              </p>
            </div>
          ))}
        </div>
        <AppleTabbar
          items={mockItems}
          activeId={activeId}
          onItemClick={setActiveId}
        />
      </div>
    )
  },
}
