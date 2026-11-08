"use client"

import { ChangeEvent, useCallback, useRef, useState } from "react"

import { useCustomEnsuredControl } from "hooks/useEnsureControl"

import { SelectOption } from "../types"
import { DEFAULT_EMPTY_TEXT } from "./constants"

export interface UseSelectProps {
  /** If true, the select is considered disabled and cannot be interacted with. */
  disabled?: boolean
  /** The currently selected option. */
  value?: SelectOption | null
  /** The default value for the select if `value` is uncontrolled. */
  defaultValue?: SelectOption | null
  /** Callback fired when the selected option changes. */
  onChange?: (option: SelectOption | null) => void
  /** The current value of the input field, for controlling component behavior. */
  inputValue?: string
  /** Callback fired when the input value changes. */
  onInputChange?: (event: ChangeEvent<HTMLInputElement>) => void
  /** Array of options available for selection. */
  options?: SelectOption[]
  /** Text displayed when no options are available or match the filter criteria. */
  emptyText?: string
  /** Custom function to filter options based on the input value. */
  filterFn?: false | ((inputValue: string, option: SelectOption) => boolean)
}

/**
 * Hook to manage the state and interactions of a select component.
 * It encapsulates logic for option selection, input change handling, dropdown visibility, and focused option management.
 */
export const useSelect = ({
  disabled,
  value: valueProp,
  onChange,
  defaultValue = null,
  inputValue: inputValueProp = "",
  onInputChange: onInputChangeProp,
  options: optionsProp = [],
  emptyText = DEFAULT_EMPTY_TEXT,
  filterFn,
}: UseSelectProps) => {
  const [value, setValue] = useCustomEnsuredControl({
    value: valueProp,
    disabled,
    defaultValue,
    onChange,
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState(inputValueProp)
  const [opened, setOpened] = useState(false)
  const [focusedOptionIndex, setFocusedOptionIndex] = useState<number | null>(
    null
  )
  const [focusedOption, setFocusedOption] = useState<SelectOption | null>(null)

  const onInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value)
      setFocusedOptionIndex(null)
      onInputChangeProp?.(event)
    },
    [onInputChangeProp]
  )

  const clearInput = useCallback(() => {
    setInputValue("")
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }, [])

  const getFilteredOptions = useCallback(() => {
    if (filterFn === false) {
      return optionsProp
    }

    const defaultFilter = (inputVal: string, option: SelectOption) => {
      const label = String(option.label).toLowerCase()
      return label.includes(inputVal.toLowerCase())
    }

    const filter = filterFn || defaultFilter

    return optionsProp.filter((option) => filter(inputValue, option))
  }, [optionsProp, inputValue, filterFn])

  const filteredOptions = getFilteredOptions()

  const options: SelectOption[] =
    filteredOptions.length === 0
      ? [{ value: "empty", label: emptyText, placeholder: emptyText }]
      : filteredOptions

  const selectOption = useCallback(
    (option: SelectOption) => {
      setValue(option)
      clearInput()
    },
    [setValue, clearInput]
  )

  return {
    // Option props
    value,
    selectOption,

    // Input props
    inputRef,
    inputValue,
    clearInput,
    onInputChange,

    // Dropdown props
    options,
    opened,
    setOpened,
    focusedOption,
    focusedOptionIndex,
    setFocusedOption,
    setFocusedOptionIndex,
  }
}
