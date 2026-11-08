import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useOnboardingHint, controller, onboardingHintRef } from "./lib"
import { markOnboardingShown } from "./useScheduleOnboarding"
import styles from "./ScheduleOnboardingHint.module.css"

const PAD = 10

const TOTAL_STEPS = 3
const STEP_INDEX: Record<string, number> = {
  searchSchedule: 0,
  openMenu: 1,
  watchSchedule: 2,
}

// Steps that don't use a dark backdrop (menu is visible underneath)
const NO_BACKDROP_STEPS = new Set(["watchSchedule"])

type Rect = { top: number; left: number; width: number; height: number }

function useTargetRect(target: Element | null): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null)

  useEffect(() => {
    if (!target) { setRect(null); return }
    const update = () => {
      const r = target.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(target)
    window.addEventListener("scroll", update, true)
    window.addEventListener("resize", update)
    return () => {
      ro.disconnect()
      window.removeEventListener("scroll", update, true)
      window.removeEventListener("resize", update)
    }
  }, [target])

  return rect
}

const SHOWN_KEY = "portal.schedule.onboarding.shown"

export const ScheduleOnboardingHint = () => {
  const { anchorRef, hint, open, onClose } = useOnboardingHint()
  const target = anchorRef.current
  const rect = useTargetRect(open ? target : null)

  // Guard: if user already finished onboarding, close any stale hint immediately
  if (open && hint && localStorage.getItem(SHOWN_KEY) === "1") {
    void controller.finishPreset("scheduleFirstVisit")
    onClose(hint.step.slug as never, "externalEvent")
    return null
  }

  const handleSkip = () => {
    markOnboardingShown()
    onClose(hint?.step.slug as never, "externalEvent")
    void controller.finishPreset("scheduleFirstVisit")
  }

  const handleNext = () => {
    if (!hint) return
    const stepIndex = STEP_INDEX[hint.step.slug] ?? 0
    const isLast = stepIndex === TOTAL_STEPS - 1
    if (isLast) {
      markOnboardingShown()
      onClose(hint.step.slug as never, "externalEvent")
      void controller.finishPreset("scheduleFirstVisit")
    } else {
      void controller.passStep(hint.step.slug)
    }
  }

  if (!open || !hint) return null

  const stepIndex = STEP_INDEX[hint.step.slug] ?? 0
  const isLast = stepIndex === TOTAL_STEPS - 1
  const noBackdrop = NO_BACKDROP_STEPS.has(hint.step.slug)
  const vw = window.innerWidth
  const vh = window.innerHeight

  const sr = rect
    ? {
        top: rect.top - PAD,
        left: rect.left - PAD,
        right: rect.left + rect.width + PAD,
        bottom: rect.top + rect.height + PAD,
      }
    : null

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="onboarding"
        className={styles.root}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Dark backdrop — only for steps without open menus */}
        {!noBackdrop && sr && (
          <>
            <div className={styles.dark} style={{ top: 0, left: 0, right: 0, height: sr.top }} onClick={handleSkip} />
            <div className={styles.dark} style={{ top: sr.top, left: 0, width: sr.left, bottom: vh - sr.bottom }} onClick={handleSkip} />
            <div className={styles.dark} style={{ top: sr.top, left: sr.right, right: 0, bottom: vh - sr.bottom }} onClick={handleSkip} />
            <div className={styles.dark} style={{ top: sr.bottom, left: 0, right: 0, bottom: 0 }} onClick={handleSkip} />
          </>
        )}
        {!noBackdrop && !sr && (
          <div className={styles.dark} style={{ inset: 0 }} onClick={handleSkip} />
        )}

        {/* Pulsing ring around target */}
        {sr && (
          <div
            className={noBackdrop ? styles.ringHighlight : styles.ring}
            style={{
              top: sr.top,
              left: sr.left,
              width: sr.right - sr.left,
              height: sr.bottom - sr.top,
            }}
          />
        )}

        {/* Floating tooltip */}
        {rect && (
          <TooltipBubble
            rect={rect}
            stepSlug={hint.step.slug}
            title={hint.step.name}
            description={hint.step.description}
            stepIndex={stepIndex}
            totalSteps={TOTAL_STEPS}
            isLast={isLast}
            noBackdrop={noBackdrop}
            vw={vw}
            vh={vh}
            onSkip={handleSkip}
            onNext={handleNext}
          />
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

type TooltipBubbleProps = {
  rect: Rect
  stepSlug: string
  title: string
  description: string
  stepIndex: number
  totalSteps: number
  isLast: boolean
  noBackdrop?: boolean
  vw: number
  vh: number
  onSkip: () => void
  onNext: () => void
}

function TooltipBubble({
  rect, stepSlug, title, description,
  stepIndex, totalSteps, isLast,
  vw, vh, onSkip, onNext,
}: TooltipBubbleProps) {
  const elementCenterX = rect.left + rect.width / 2
  const elementBottom = rect.top + rect.height + PAD

  // For watchSchedule: below the element, right-aligned to it, arrow pointing up
  if (stepSlug === "watchSchedule") {
    const tooltipWidth = Math.min(220, vw - 16)
    const top = rect.top + rect.height + PAD + 6
    // right-align tooltip to right edge of element, clamp to screen
    const left = Math.max(8, Math.min(rect.left + rect.width - tooltipWidth, vw - tooltipWidth - 8))
    const arrowLeft = Math.max(12, Math.min(rect.left + rect.width / 2 - left - 8, tooltipWidth - 28))

    return (
      <motion.div
        ref={onboardingHintRef}
        className={`${styles.tooltip} ${styles.tooltipClean}`}
        style={{ top, left, width: tooltipWidth }}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ type: "spring", stiffness: 320, damping: 28, delay: 0.1 }}
      >
        <div className={styles.arrowUp} style={{ left: arrowLeft }} />
        <p className={styles.tooltipTitle}>{title}</p>
        <p className={styles.tooltipDesc}>{description}</p>
        <div className={styles.tooltipActions}>
          <button className={styles.nextBtn} onClick={onNext}>Понятно</button>
        </div>
      </motion.div>
    )
  }

  // Default: tooltip below or above element
  const spaceBelow = vh - elementBottom
  const above = spaceBelow < 180

  const tooltipWidth = Math.min(280, vw - 32)
  let left = elementCenterX - tooltipWidth / 2
  left = Math.max(16, Math.min(left, vw - tooltipWidth - 16))
  const arrowLeft = Math.max(12, Math.min(elementCenterX - left - 8, tooltipWidth - 28))

  const top = above ? rect.top - PAD - 8 : elementBottom + 8

  return (
    <motion.div
      className={styles.tooltip}
      style={{
        top,
        left,
        width: tooltipWidth,
        ...(above ? { transform: "translateY(-100%)" } : {}),
      }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 320, damping: 28, delay: 0.1 }}
    >
      {!above && <div className={styles.arrowUp} style={{ left: arrowLeft }} />}

      <div className={styles.tooltipHeader}>
        <span className={styles.tapLabel}>Нажмите сюда</span>
        <span className={styles.counter}>{stepIndex + 1} / {totalSteps}</span>
      </div>
      <p className={styles.tooltipTitle}>{title}</p>
      <p className={styles.tooltipDesc}>{description}</p>

      <div className={styles.tooltipActions}>
        <button className={styles.skipBtn} onClick={onSkip}>Пропустить</button>
        <button className={styles.nextBtn} onClick={onNext}>
          {isLast ? "Понятно" : "Далее"}
        </button>
      </div>

      {above && <div className={styles.arrowDown} style={{ left: arrowLeft }} />}
    </motion.div>
  )
}
