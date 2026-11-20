// Slide-to-confirm: drag the arrow to the right to arm the action.
//
// Built on pointer events so a mouse, a pen and a finger share one code
// path. Keyboard users get the same outcome — arrow keys nudge the thumb
// and Enter completes it — because a control that can only be operated by
// dragging would be unusable for anyone navigating by keyboard, and this
// one guards an irreversible action.
//
// `onConfirm` fires exactly once per completed slide, on release past the
// threshold. After that the control stays completed until the parent
// remounts it, so it cannot fire twice.

import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_LABEL = 'Slide this arrow to the right to delete your account permanently'

export default function SlideToConfirm({
  onConfirm,
  disabled = false,
  label = DEFAULT_LABEL,
  actionLabel = 'Delete my account permanently',
}) {
  const trackRef = useRef(null)
  const thumbRef = useRef(null)
  const travelRef = useRef(1)
  // Progress lives in a ref as well as state: the pointerup handler has to
  // read the final value synchronously, and a state updater is not the
  // place to fire a callback.
  const progressRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [done, setDone] = useState(false)
  const dragStart = useRef(0)
  const fired = useRef(false)

  const measure = useCallback(() => {
    const track = trackRef.current
    const thumb = thumbRef.current
    if (!track) return 1
    travelRef.current = Math.max(1, track.clientWidth - (thumb?.offsetWidth || 52) - 8)
    return travelRef.current
  }, [])

  const set = useCallback((value) => {
    progressRef.current = value
    setProgress(value)
  }, [])

  const complete = useCallback(() => {
    if (fired.current) return
    fired.current = true
    set(1)
    setDragging(false)
    setDone(true)
    onConfirm?.()
  }, [onConfirm, set])

  useEffect(() => {
    if (!dragging) return
    const move = (event) => {
      const distance = event.clientX - dragStart.current
      set(Math.min(1, Math.max(0, distance / travelRef.current)))
    }
    const release = () => {
      setDragging(false)
      if (progressRef.current > 0.9) complete()
      else set(0)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', release)
    window.addEventListener('pointercancel', release)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', release)
    }
  }, [dragging, complete, set])

  const onPointerDown = (event) => {
    if (disabled || done) return
    measure()
    dragStart.current = event.clientX
    setDragging(true)
  }

  const onKeyDown = (event) => {
    if (disabled || done) return
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      const next = Math.min(1, progressRef.current + 0.25)
      set(next)
      measure()
      if (next >= 1) complete()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      set(Math.max(0, progressRef.current - 0.25))
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      complete()
    }
  }

  return (
    <div className={`slide ${disabled ? 'slide-off' : ''} ${done ? 'slide-done' : ''}`}>
      <div
        className="slide-track"
        ref={trackRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-valuetext={done ? 'Confirmed' : `${Math.round(progress * 100)} percent — press Enter to confirm`}
        aria-disabled={disabled || done}
        onKeyDown={onKeyDown}
      >
        <div className="slide-fill" style={{ width: `${progress * 100}%` }} aria-hidden="true" />
        <span className="slide-hint" style={{ opacity: Math.max(0, 1 - progress * 2.6) }} aria-hidden="true">
          {label}
        </span>
        <button
          type="button"
          ref={thumbRef}
          className="slide-thumb"
          aria-hidden="true"
          tabIndex={-1}
          disabled={disabled || done}
          onPointerDown={onPointerDown}
          style={{ transform: `translateX(${progress * travelRef.current}px)` }}
        >
          {done ? '✓' : '→'}
        </button>
      </div>
      {/* Keyboard and screen-reader path: the same action, reachable but not
          drawn. The slide is the only thing on screen — a visible text button
          underneath turns a deliberate drag into one careless click, and on
          the page that deletes a whole organization that is the wrong trade. */}
      <button type="button" className="sr-only" onClick={complete} disabled={disabled || done}>
        {actionLabel}
      </button>
    </div>
  )
}
