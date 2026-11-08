import { motion, useAnimation } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import styles from "./SwipeableScheduleList.module.css"
import dayjs from "dayjs"
import { Schedule } from "./Schedule"
import useLessons from "../../hooks/useLessons"
import { LessonEntity } from "../../model/schemas"

type SwipeableScheduleListProps = {
  index: string
  onIndexChange: (next: string) => void
  panels: string[]
  handleSelect: (item: LessonEntity) => void
}

const add = (index: string) => dayjs(index).add(1, "day").format("YYYY-MM-DD")
const substruct = (index: string) =>
  dayjs(index).subtract(1, "day").format("YYYY-MM-DD")

export const SwipeableScheduleList = ({
  index,
  onIndexChange,
  panels,
  handleSelect,
}: SwipeableScheduleListProps) => {
  const controls = useAnimation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const lessons = useLessons()
  const swipedRef = useRef(false)

  useEffect(() => {
    if (swipedRef.current) {
      swipedRef.current = false
      controls.start({ x: "-100%", transition: { duration: 0 } })
    } else {
      controls.start({
        x: "-100%",
        transition: { duration: 0.3, ease: "easeOut" },
      })
    }
  }, [controls, index])

  const handleDragEnd = async (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    setDragging(false)
    const width = containerRef.current?.offsetWidth || window.innerWidth
    const threshold = width / 6
    const velocity = info.velocity.x
    const offset = info.offset.x
    if (offset < -threshold || velocity < -300) {
      swipedRef.current = true
      await controls.start({ x: "-200%", transition: { duration: 0.2 } })
      onIndexChange(add(index))
      return
    }

    if (offset > threshold || velocity > 300) {
      swipedRef.current = true
      await controls.start({ x: "0%", transition: { duration: 0.2 } })
      onIndexChange(substruct(index))
      return
    }
    controls.start({ x: "-100%", transition: { duration: 0.2 } })
  }

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const delta = event.shiftKey ? event.deltaY : event.deltaX
    if (Math.abs(delta) < 20) {
      return
    }

    event.preventDefault()
    if (delta > 0) {
      onIndexChange(add(index))
    } else {
      onIndexChange(substruct(index))
    }
  }

  return (
    <div
      ref={containerRef}
      className={styles.wrapper}
      onWheel={handleWheel}
      aria-label="Свайп для смены дня"
    >
      <motion.div
        className={styles.track}
        drag="x"
        dragMomentum={false}
        onDragStart={() => setDragging(true)}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ pointerEvents: dragging ? "none" : "auto" }}
      >
        {panels.map((item) => {
          return (
            <div key={item} className={styles.panel}>
              <Schedule
                date={item as string}
                key={item}
                data={lessons[item as string]}
                onSelect={handleSelect}
              />
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}
