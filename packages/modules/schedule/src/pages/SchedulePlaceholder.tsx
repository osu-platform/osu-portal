import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { magnificationGlass } from "@portal/shared-assets"
import { Button, Placeholder } from "@portal/shared-ui"
import { useRef, useEffect, useState } from "react"
import { ScheduleSelect } from "../features/schedule-view"
import { useNavigate } from "react-router-dom"
import { useSchedulePreferences } from "../features/schedule-view/hooks/useSchedulePreferences"

const AnimatedPlaceholder = ({ animation }: { animation: any }) => {
  const instanceRef = useRef<any>(null)
  useEffect(() => {
    const interval = setInterval(() => {
      instanceRef.current?.seek?.(0)
      instanceRef.current?.play?.()
    }, 3500)
    return () => clearInterval(interval)
  }, [])
  return (
    <DotLottieReact
      data={animation}
      autoplay
      loop={false}
      dotLottieRefCallback={(instance) => {
        instanceRef.current = instance
      }}
    />
  )
}

export const SchedulePlaceholder = () => {
  const [open, setOpen] = useState<boolean>(false)
  const navigate = useNavigate()
  const { defaultSchedule, load, loaded } = useSchedulePreferences()

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!loaded) return

    // Prefer backend default
    if (defaultSchedule) {
      const query = defaultSchedule.query ?? ""
      const url = `/schedule/${defaultSchedule.type}/${defaultSchedule.id}/day${query}`
      navigate(url)
      return
    }

    // Fall back to localStorage (written before backend loaded, or offline)
    const raw = localStorage.getItem("default-schedule")
    if (raw) {
      try {
        const data = JSON.parse(raw)
        if (data?.type && data?.id && data?.view) {
          const url = `/schedule/${data.type}/${data.id}/day${data.query ?? ""}`
          navigate(url)
        }
      } catch {
        // ignore
      }
    }
  }, [loaded, defaultSchedule])

  return (
    <>
      <Placeholder
        description={"Нажмите на кнопку ниже чтобы выбрать расписание"}
        header={"Выберите расписание"}
        action={<Button onClick={() => setOpen(true)}>Выбрать</Button>}
      >
        <AnimatedPlaceholder animation={magnificationGlass} />
      </Placeholder>
      <ScheduleSelect
        open={open}
        onOpenChange={setOpen}
        setTitle={() => {}}
      />
    </>
  )
}
