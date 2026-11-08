import React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { useTheme, getCSSVariable } from "@portal/shared-theme"

/**
 * Component to display all theme tokens
 */
const ThemePalette = () => {
  const { tokens, isDark } = useTheme()

  const groups = {
    Backgrounds: ["bgPrimary", "bgSecondary", "bgElevated"],
    Text: [
      "textPrimary",
      "textSecondary",
      "textTertiary",
      "textAccent",
      "textDanger",
    ],
    Borders: ["borderDefault", "borderSubtle"],
    Actions: [
      "actionPrimaryBg",
      "actionPrimaryText",
      "actionDangerBg",
      "actionDangerText",
    ],
    Surfaces: ["surfaceSection", "surfaceHeader"],
    Other: ["accent", "scheme"],
  }

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Theme Showcase</h1>
      <p>
        Current Theme: <strong>{isDark ? "Dark" : "Light"}</strong>
      </p>

      <div style={{ display: "grid", gap: "32px" }}>
        {Object.entries(groups).map(([groupName, keys]) => (
          <div key={groupName}>
            <h2
              style={{
                borderBottom: "1px solid var(--p-color-border-default)",
                paddingBottom: "8px",
              }}
            >
              {groupName}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "16px",
              }}
            >
              {keys.map((key) => {
                const value = tokens[key as keyof typeof tokens]
                const variable = getCSSVariable(key as any)

                return (
                  <div
                    key={key}
                    style={{
                      border: "1px solid var(--p-color-border-subtle)",
                      borderRadius: "8px",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        height: "60px",
                        backgroundColor:
                          key.includes("Text") ||
                          (key.includes("action") && key.includes("Text"))
                            ? tokens.bgPrimary
                            : value,
                        color: key.includes("Text")
                          ? value
                          : tokens.textPrimary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                        ...(key.includes("Text") ||
                        (key.includes("action") && key.includes("Text"))
                          ? {}
                          : {
                              borderBottom:
                                "1px solid var(--p-color-border-subtle)",
                            }),
                      }}
                    >
                      {(key.includes("Text") ||
                        (key.includes("action") && key.includes("Text"))) && (
                        <span>Aa</span>
                      )}
                    </div>
                    <div style={{ padding: "12px", fontSize: "12px" }}>
                      <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                        {key}
                      </div>
                      <div
                        style={{
                          color: "var(--p-color-text-secondary)",
                          marginBottom: "4px",
                        }}
                      >
                        {variable}
                      </div>
                      <code
                        style={{
                          backgroundColor: "var(--p-color-bg-secondary)",
                          padding: "2px 4px",
                          borderRadius: "4px",
                        }}
                      >
                        {value}
                      </code>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const meta: Meta = {
  title: "Theme/Showcase",
  component: ThemePalette,
  parameters: {
    layout: "fullscreen",
  },
}

export default meta
type Story = StoryObj

export const Default: Story = {}
