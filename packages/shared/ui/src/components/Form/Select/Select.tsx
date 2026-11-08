"use client"

import React, {
  Children,
  forwardRef,
  InputHTMLAttributes,
  isValidElement,
  KeyboardEvent,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
} from "react"
import styles from "./Select.module.css"

import { Keys } from "helpers/accessibility"
import { classNames } from "helpers/classNames"
import { callMultiple } from "helpers/function"
import { multipleRef } from "helpers/react/refs"
import { useGlobalClicks } from "hooks/useGlobalClicks"

import { Icon20ChevronDown } from "icons/20/chevron_down"

import { FormInput, FormPublicProps } from "components/Form/FormInput/FormInput"
import { SelectBase } from "./components/SelectBase/SelectBase"
import {
  SelectDropdown,
  SelectDropdownProps,
} from "./components/SelectDropdown/SelectDropdown"
import { useSelect, UseSelectProps } from "./hooks/useSelect"
import { SelectOption } from "./types"

export interface SelectProps
  extends
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      "value" | "defaultValue" | "onChange" | "children"
    >,
    Omit<FormPublicProps, "after">,
    Pick<SelectDropdownProps, "renderOption">,
    Pick<
      UseSelectProps,
      | "value"
      | "defaultValue"
      | "onChange"
      | "filterFn"
      | "onInputChange"
      | "inputValue"
      | "emptyText"
    > {
  /**
   * The `options` property defines the available options within the select dropdown.
   * Each option is represented as an object conforming to the `SelectOption` structure,
   * which typically includes properties like `value` (the option's value) and `label` (the human-readable text associated with the option).
   */
  options?: SelectOption[]
  /** Deprecated: use `options` instead of children. */
  children?: ReactNode
  /** Enables input typing and filtering. */
  searchable?: boolean
}

/**
 * A comprehensive component for rendering a select input field with customizable options and dropdown behaviors.
 * It integrates functionality for selecting one option, searching, and filtering options based on user input.
 */
export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      // FormInput options
      header,
      before,
      status,
      className,
      children,
      disabled,
      readOnly,
      onMouseDown,

      // SelectDropdownProps
      options: optionsProp,
      renderOption,

      // SelectInputProps
      value: valueProp,
      defaultValue,
      inputValue: inputValueProp,
      onChange,
      onInputChange: onInputChangeProp,
      onFocus,
      onBlur,
      onKeyDown,
      placeholder,
      emptyText,
      filterFn,
      searchable = true,
      ...restProps
    },
    ref
  ) => {
    const isSearchable = searchable !== false
    const optionsFromChildren = useMemo(() => {
      if (!children) {
        return []
      }

      return Children.toArray(children)
        .filter(
          (
            child
          ): child is ReactElement<{
            value?: SelectOption["value"]
            children?: ReactNode
          }> => isValidElement(child) && child.type === "option"
        )
        .map((child) => {
          const childValue = child.props.value
          const childLabel = child.props.children
          const value =
            childValue ??
            (typeof childLabel === "string" || typeof childLabel === "number"
              ? childLabel
              : "")
          const label =
            typeof childLabel === "string" || typeof childLabel === "number"
              ? childLabel
              : isValidElement(childLabel)
                ? childLabel
                : String(childLabel ?? "")

          return {
            value,
            label,
          }
        })
    }, [children])

    const resolvedOptions = optionsProp ?? optionsFromChildren
    const {
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
    } = useSelect({
      // Option props
      value: valueProp,
      defaultValue,
      onChange,

      // Input props
      inputValue: isSearchable ? inputValueProp : "",
      onInputChange: isSearchable ? onInputChangeProp : undefined,

      // Dropdown props
      options: resolvedOptions,
      emptyText,
      filterFn: isSearchable ? filterFn : false,

      // Other props
      disabled,
    })

    const containerRef = useRef<HTMLDivElement>(null)
    const rootRef = useRef<HTMLDivElement>(null!)

    const dropdownAriaId = useId()
    const dropdownScrollBoxRef = useRef<HTMLDivElement>(null!)

    const handleFocus = () => {
      setOpened(true)
      setFocusedOptionIndex(null)
    }

    const optionsNodes = useRef<HTMLElement[]>([]).current
    const scrollToElement = (index: number, center = false) => {
      const dropdown = dropdownScrollBoxRef.current
      const item = optionsNodes[index]

      if (!item || !dropdown) {
        return
      }

      const dropdownHeight = dropdown.offsetHeight
      const { scrollTop } = dropdown
      const itemTop = item.offsetTop
      const itemHeight = item.offsetHeight

      if (center) {
        dropdown.scrollTop = itemTop - dropdownHeight / 2 + itemHeight / 2
      } else if (itemTop + itemHeight > dropdownHeight + scrollTop) {
        dropdown.scrollTop = itemTop - dropdownHeight + itemHeight
      } else if (itemTop < scrollTop) {
        dropdown.scrollTop = itemTop
      }
    }

    const focusOptionByIndex = (index: number, oldIndex: number | null) => {
      let focusedIndex = index
      const { length } = options

      if (index < 0) {
        focusedIndex = length - 1
      } else if (index >= length) {
        focusedIndex = 0
      }

      if (focusedIndex === oldIndex) {
        return
      }

      scrollToElement(focusedIndex)
      setFocusedOptionIndex(focusedIndex)
    }

    const focusOption = (
      nextIndex: number | null,
      direction: "next" | "prev"
    ) => {
      let index = nextIndex === null ? -1 : nextIndex

      if (direction === "next") {
        index += 1
      }

      if (direction === "prev") {
        index -= 1
      }

      focusOptionByIndex(index, focusedOptionIndex)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.defaultPrevented) {
        return
      }

      switch (event.key) {
        case Keys.ARROW_UP:
        case Keys.ARROW_DOWN:
          event.preventDefault()

          if (opened) {
            focusOption(
              focusedOptionIndex,
              event.key === Keys.ARROW_UP ? "prev" : "next"
            )
            return
          }

          setOpened(true)
          setFocusedOptionIndex(0)
          break

        case Keys.ENTER: {
          if (!opened) {
            break
          }

          event.preventDefault()

          if (focusedOptionIndex === null) {
            break
          }

          const foundOption = options[focusedOptionIndex]
          if (!foundOption || "placeholder" in foundOption) {
            break
          }

          selectOption(foundOption)
          setFocusedOptionIndex(null)
          setOpened(false)
          break
        }

        case Keys.ESCAPE:
        case Keys.TAB:
          opened && closeDropdown()
          break

        default:
          break
      }
    }

    useEffect(() => {
      if (focusedOptionIndex === null) {
        setFocusedOption(null)
        return
      }

      const foundFocusedOptionIndex = options[focusedOptionIndex]
      if (
        foundFocusedOptionIndex &&
        !("placeholder" in foundFocusedOptionIndex)
      ) {
        setFocusedOption(foundFocusedOptionIndex)
      }
    }, [options, focusedOptionIndex, setFocusedOption])

    const onDropdownMouseLeave = useCallback(() => {
      setFocusedOptionIndex(null)
    }, [setFocusedOptionIndex])

    const closeDropdown = useCallback(() => {
      setOpened(false)
      setFocusedOptionIndex(null)
      clearInput()
    }, [setOpened, setFocusedOptionIndex, clearInput])

    const handleOptionSelect = useCallback(
      (option: SelectOption) => {
        selectOption(option)
        closeDropdown()
      },
      [selectOption, closeDropdown]
    )

    const toggleOpened = () => {
      setOpened((prevOpened) => {
        const nextOpened = !prevOpened
        if (!nextOpened) {
          setFocusedOptionIndex(null)
          clearInput()
        }
        return nextOpened
      })
    }

    const handleClickOutside = useCallback(() => {
      closeDropdown()
    }, [closeDropdown])

    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (disabled) return
        if (opened) {
          e.preventDefault()
          closeDropdown()
        }
        // when closed: browser focuses input naturally → handleFocus opens
      },
      [disabled, opened, closeDropdown]
    )

    const handleNonSearchableMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (disabled) return
        e.preventDefault()
        if (opened) {
          closeDropdown()
        } else {
          setOpened(true)
          setFocusedOptionIndex(null)
          inputRef.current?.focus()
        }
      },
      [disabled, opened, closeDropdown, setOpened, setFocusedOptionIndex, inputRef]
    )

    const handlePointerDown = useCallback(
      (e: React.PointerEvent) => {
        if (disabled) return
        e.preventDefault()
        if (opened) {
          closeDropdown()
        } else {
          setOpened(true)
          setFocusedOptionIndex(null)
          inputRef.current?.focus()
        }
      },
      [disabled, opened, closeDropdown, setOpened, setFocusedOptionIndex, inputRef]
    )

    const setOptionNode = (index: number, node: HTMLElement) => {
      optionsNodes[index] = node
    }

    useGlobalClicks(
      handleClickOutside,
      opened ? rootRef : null,
      opened ? dropdownScrollBoxRef : null
    )

    const controlledStatus = status || (opened ? "focused" : "default")
    const selectedLabel =
      value &&
      (typeof value.label === "string" || typeof value.label === "number")
        ? String(value.label)
        : ""
    const displayValue = isSearchable
      ? opened
        ? inputValue
        : inputValue || selectedLabel
      : selectedLabel
    const inputReadOnly = readOnly || !isSearchable
    return (
      <FormInput
        ref={multipleRef(ref, containerRef)}
        header={header}
        before={before}
        status={controlledStatus}
        disabled={disabled}
        className={classNames(styles.wrapper, className)}
      >
        <SelectBase
          {...restProps}
          ref={rootRef}
          className={styles.base}
          inputRef={inputRef}
          inputValue={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={inputReadOnly}
          onWrapperMouseDown={!isSearchable ? handleNonSearchableMouseDown : undefined}
          onWrapperPointerDown={!isSearchable ? handlePointerDown : undefined}
          onChange={isSearchable ? onInputChange : undefined}
          onFocus={callMultiple(handleFocus, onFocus)}
          onBlur={onBlur}
          onKeyDown={callMultiple(handleKeyDown, onKeyDown)}
          onMouseDown={isSearchable ? callMultiple(handleMouseDown, onMouseDown) : onMouseDown}
          inputMode={isSearchable ? restProps.inputMode : "none"}
          role="combobox"
          aria-expanded={opened}
          aria-controls={dropdownAriaId}
          aria-haspopup="listbox"
        />
        <Icon20ChevronDown
          aria-hidden
          onClick={toggleOpened}
          className={styles.chevron}
        />
        {opened && (
          <SelectDropdown
            ref={dropdownScrollBoxRef}
            dropdownAriaId={dropdownAriaId}
            options={options}
            onMouseLeave={onDropdownMouseLeave}
            targetRef={rootRef}
            setFocusedOptionIndex={setFocusedOptionIndex}
            renderOption={renderOption}
            focusedOption={focusedOption}
            value={value}
            setOptionNode={setOptionNode}
            onSelectOption={handleOptionSelect}
          />
        )}
      </FormInput>
    )
  }
)

Select.displayName = "Select"
