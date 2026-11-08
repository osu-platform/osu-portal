import { useRef, useState } from "react"
// @ts-expect-error - storybook types are available in root setup
import type { Meta, StoryObj } from "@storybook/react"
import { useClickOutside } from "../hooks/useClickOutside"

/**
 * Demonstration of useClickOutside hook
 * Shows how to automatically close a menu/dropdown when clicking outside
 */
const ClickOutsideDemo = () => {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside of triggerRef or menuRef
  useClickOutside(
    () => {
      if (isOpen) setIsOpen(false)
    },
    menuRef as React.RefObject<Element>,
    triggerRef as React.RefObject<Element>
  )

  return (
    <div style={{ padding: "40px", fontFamily: "system-ui" }}>
      <h2>useClickOutside Example</h2>
      <p>
        Click the button to open the menu. Click outside to close it. Menu won't
        close if you click on the trigger button or inside the menu.
      </p>

      <div style={{ position: "relative", display: "inline-block" }}>
        <button
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: "10px 16px",
            fontSize: "14px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            background: "white",
            cursor: "pointer",
            fontWeight: isOpen ? "bold" : "normal",
          }}
        >
          {isOpen ? "▼ Menu Open" : "► Open Menu"}
        </button>

        {isOpen && (
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: "8px",
              background: "white",
              border: "1px solid #ccc",
              borderRadius: "6px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              minWidth: "160px",
              zIndex: 1,
            }}
          >
            <button
              onClick={() => {
                console.log("Action 1 clicked")
                setIsOpen(false)
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 16px",
                border: "none",
                background: "none",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "14px",
                borderBottom: "1px solid #f0f0f0",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f5f5f5")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              Option 1
            </button>
            <button
              onClick={() => {
                console.log("Action 2 clicked")
                setIsOpen(false)
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 16px",
                border: "none",
                background: "none",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "14px",
                borderBottom: "1px solid #f0f0f0",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f5f5f5")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              Option 2
            </button>
            <button
              onClick={() => {
                console.log("Action 3 clicked")
                setIsOpen(false)
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 16px",
                border: "none",
                background: "none",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "14px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f5f5f5")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              Option 3
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "40px",
          padding: "20px",
          background: "#f5f5f5",
          borderRadius: "6px",
          fontFamily: "monospace",
          fontSize: "13px",
          lineHeight: "1.6",
        }}
      >
        <strong>How to use:</strong>
        <pre style={{ margin: "10px 0 0" }}>
          {`import { useClickOutside } from "@portal/shared-ui"
import { useRef, useState } from "react"

export function MyDropdown() {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useClickOutside(
    () => setOpen(false),
    menuRef,
    triggerRef  // Optional: exclude trigger button
  )

  return (
    <>
      <button ref={triggerRef}>Menu</button>
      {open && <div ref={menuRef}>Content</div>}
    </>
  )
}`}
        </pre>
      </div>
    </div>
  )
}

const meta: Meta = {
  title: "Hooks/useClickOutside",
  component: ClickOutsideDemo,
  tags: ["autodocs"],
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <ClickOutsideDemo />,
}

export const WithPadding: Story = {
  render: () => (
    <div style={{ padding: "60px 40px", background: "#f9f9f9" }}>
      <ClickOutsideDemo />
    </div>
  ),
}
