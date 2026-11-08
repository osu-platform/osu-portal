import {
  forwardRef,
  InputHTMLAttributes,
  MouseEvent,
  PointerEvent,
  RefObject,
} from "react"
import styles from "./SelectBase.module.css"

import { classNames } from "helpers/classNames"

export interface SelectBaseProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "children" | "defaultValue" | "value"
> {
  /** Ref to the input element within the select base. */
  inputRef: RefObject<HTMLInputElement | null>
  /** Current input value (search text or selected label). */
  inputValue: string
  /** Mouse handler for the wrapper to allow opening on any click. */
  onWrapperMouseDown?: (event: MouseEvent<HTMLDivElement>) => void
  /** Pointer handler for the wrapper to allow opening on touch devices. */
  onWrapperPointerDown?: (event: PointerEvent<HTMLDivElement>) => void
}

/**
 * Renders the base layout of the select including the input field.
 */
export const SelectBase = forwardRef<HTMLDivElement, SelectBaseProps>(
  (
    {
      inputRef,
      className,
      inputValue,
      placeholder,
      disabled,
      readOnly,
      onWrapperMouseDown,
      onWrapperPointerDown,
      ...restProps
    },
    ref
  ) => {
    const isDisabled = !!disabled

    const {
      children: _children,
      dangerouslySetInnerHTML: _dangerouslySetInnerHTML,
      defaultValue: _defaultValue,
      value: _value,
      ...inputProps
    } = restProps as InputHTMLAttributes<HTMLInputElement>

    return (
      <div
        ref={ref}
        className={classNames(styles.wrapper, className)}
        data-disabled={isDisabled}
        onMouseDown={onWrapperMouseDown}
        onPointerDown={onWrapperPointerDown}
      >
        <input
          type="text"
          className={styles.input}
          ref={inputRef}
          placeholder={placeholder}
          disabled={isDisabled}
          readOnly={readOnly}
          {...inputProps}
          value={inputValue}
        />
      </div>
    )
  }
)

SelectBase.displayName = "SelectBase"
