import { ReactElement } from "react"

export type SelectOptionValue = string | number
export type SelectOptionLabel = ReactElement | string | number

export type SelectOption = {
  value: SelectOptionValue
  label: SelectOptionLabel
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  [index: string]: any
}
