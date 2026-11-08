import { RefObject, useCallback } from "react"
import { useGlobalClicks } from "./useGlobalClicks"

/**
 * A hook that handles clicks outside of specified elements.
 * Useful for closing dropdowns, popovers, modals and similar components.
 *
 * @param callback - Function to call when a click outside is detected
 * @param refs - References to elements that should be considered "inside"
 *
 * @example
 * ```tsx
 * const menuRef = useRef<HTMLDivElement>(null)
 * const triggerRef = useRef<HTMLButtonElement>(null)
 *
 * useClickOutside(
 *   () => setOpen(false),
 *   menuRef,
 *   triggerRef  // Exclude trigger button from click-outside detection
 * )
 * ```
 */
export const useClickOutside = (
  callback: (event: MouseEvent) => void,
  ...refs: (RefObject<any> | undefined | null)[]
) => {
  const memoCallback = useCallback(callback, [callback])
  useGlobalClicks(
    memoCallback,
    ...(refs as (RefObject<Element> | undefined | null)[])
  )
}
