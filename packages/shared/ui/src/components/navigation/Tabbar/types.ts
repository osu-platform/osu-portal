import { ReactNode } from "react"

export interface TabbarItem {
  id: string
  text: string
  icon?: ReactNode | ((className: string) => ReactNode)
}
