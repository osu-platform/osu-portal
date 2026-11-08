import { useLayoutEffect, useRef, useState } from "react"
import { Text } from "@portal/shared-ui"
import styles from "./LessonSection.module.css"

type LessonTitleProps = {
  name: string
  shortName?: string
}

export const LessonTitle = ({ name, shortName }: LessonTitleProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [useShort, setUseShort] = useState(false)

  useLayoutEffect(() => {
    const container = containerRef.current
    const measure = measureRef.current
    if (!container || !measure || !shortName) {
      setUseShort(false)
      return
    }

    const check = () => setUseShort(measure.scrollWidth > container.clientWidth)
    check()

    const ro = new ResizeObserver(check)
    ro.observe(container)
    return () => ro.disconnect()
  }, [name, shortName])

  return (
    <div ref={containerRef} className={styles.titleContainer}>
      <span ref={measureRef} className={styles.titleMeasure} aria-hidden="true">
        {name}
      </span>
      <Text wrap="wrap" className={styles.subject}>
        {useShort && shortName ? shortName : name}
      </Text>
    </div>
  )
}

export default LessonTitle
