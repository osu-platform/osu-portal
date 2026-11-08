declare module "*.module.css" {
  const classes: { [key: string]: string }
  export default classes
}

declare module "@neoconfetti/react" {
  import { ComponentType } from "react"
  interface ConfettiProps {
    particleCount?: number
    particleSize?: number
    duration?: number
    colors?: string[]
    force?: number
    stageWidth?: number
    stageHeight?: number
    delay?: number
    particleShape?: "mix" | "circles" | "rectangles"
  }
  export const Confetti: ComponentType<ConfettiProps>
}
