import {
  forwardRef,
  ForwardRefExoticComponent,
  Fragment,
  MouseEvent,
  RefAttributes,
  RefObject,
} from "react"
import styles from "./SelectDropdown.module.css"

import { Cell, CellProps } from "components/Blocks/Cell/Cell"
import { SelectOption } from "components/Form/Select/types"
import { Popper } from "components/Overlays/Popper/Popper"
import { renderOptionDefault } from "./constants"

export interface SelectDropdownProps {
  /** Array of available options. */
  options: SelectOption[]
  /** The currently selected option. */
  value: SelectOption | null
  /** Reference to the target element the dropdown is associated with. */
  targetRef: RefObject<HTMLElement>
  /** Accessibility ID for the dropdown. */
  dropdownAriaId: string
  /** Currently focused option within the dropdown. */
  focusedOption: SelectOption | null
  /** Function to register a DOM node with an option index. */
  setOptionNode: (index: number, node: HTMLElement) => void
  /** Function to update the index of the focused option. */
  setFocusedOptionIndex: (index: number) => void
  /** Mouse leave event handler for the dropdown. */
  onMouseLeave: (event: MouseEvent<HTMLDivElement>) => void
  /** Function to select an option. */
  onSelectOption: (option: SelectOption) => void
  /** Custom render function for each option. Defaults to a basic implementation. */
  renderOption?: ForwardRefExoticComponent<CellProps & RefAttributes<unknown>>
}

/**
 * Renders the dropdown menu for the select input, including all options and managing interactions such as selection, focus, and mouse events.
 * Utilizes the `Popper` component for positioning relative to the input field.
 */
export const SelectDropdown = forwardRef<HTMLDivElement, SelectDropdownProps>(
  (
    {
      dropdownAriaId,
      options,
      onMouseLeave,
      targetRef,
      setFocusedOptionIndex,
      renderOption = renderOptionDefault,
      focusedOption,
      value,
      setOptionNode,
      onSelectOption,
    },
    ref
  ) => {
    const isEmptyOption = (option: SelectOption) => {
      return option && "placeholder" in option
    }

    return (
      <Popper
        id={dropdownAriaId}
        ref={ref}
        targetRef={targetRef}
        onMouseLeave={onMouseLeave}
        onWheelCapture={(event) => event.stopPropagation()}
        onTouchMoveCapture={(event) => event.stopPropagation()}
        autoUpdateOnTargetResize
        allowCrossAxisFlip={false}
        role="listbox"
        placement="bottom-start"
        sameWidth
        withArrow={false}
        style={{
          zIndex: "calc(var(--p-z-overlay) + 5)",
          pointerEvents: "auto",
        }}
        className={styles.wrapper}
      >
        {options.map((option, index) => {
          if (isEmptyOption(option)) {
            return (
              <Cell key="empty" readOnly className={styles.empty}>
                {option.placeholder}
              </Cell>
            )
          }

          return (
            <Fragment key={`${typeof option.value}-${option.label}`}>
              {renderOption({
                className: styles.option,
                hovered: focusedOption
                  ? option.value === focusedOption.value
                  : false,
                children: option.label,
                selected: value ? option.value === value.value : false,
                ref: (node: HTMLElement) => setOptionNode(index, node),
                onMouseDown: (event: MouseEvent<HTMLDivElement>) => {
                  if (event.defaultPrevented) {
                    return
                  }

                  onSelectOption(option)
                },
                onMouseEnter: () => setFocusedOptionIndex(index),
              })}
            </Fragment>
          )
        })}
      </Popper>
    )
  }
)

SelectDropdown.displayName = "SelectDropdown"
