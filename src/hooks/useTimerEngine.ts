import { useEffect, useRef } from 'react'
import { useTimerStore, BREAK_DURATION } from '../stores/timerStore'
import { TimerMode } from '../types'
import { timerEventEmitter } from '../utils/eventEmitter'
import { TimerEventType } from '../types/events'

const WORK_DURATION = 1200 // 20 minutes in seconds
const UPDATE_INTERVAL = 100 // Update every 100ms for smooth animation

/**
 * Custom hook for timer engine with requestAnimationFrame-based time control
 * Implements drift compensation and automatic state transitions
 */
export const useTimerEngine = () => {
  const {
    timerMode,
    isRunning,
    elapsedTime,
    sessionCount,
    currentPhase,
    startTimestamp,
    updateElapsedTime,
    transitionToBreak,
    transitionToIdle,
  } = useTimerStore()

  const animationFrameRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number>(0)
  const accumulatedTimeRef = useRef<number>(0)

  useEffect(() => {
    if (!isRunning || !startTimestamp) {
      // Clean up animation frame if not running
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      return
    }

    // Initialize refs for new timer session
    lastUpdateRef.current = performance.now()
    accumulatedTimeRef.current = elapsedTime

    // RAF-based timer loop
    const updateTimer = () => {
      const now = performance.now()
      const delta = now - lastUpdateRef.current

      // Only update if enough time has passed (throttle to ~100ms)
      if (delta >= UPDATE_INTERVAL) {
        // Calculate elapsed time in seconds with drift compensation
        const deltaSeconds = delta / 1000
        accumulatedTimeRef.current += deltaSeconds

        // Update store with new elapsed time
        updateElapsedTime(accumulatedTimeRef.current)

        // Check for automatic state transitions
        const maxDuration =
          currentPhase === 'work' ? WORK_DURATION : BREAK_DURATION

        if (accumulatedTimeRef.current >= maxDuration) {
          // Transition to next state
          if (timerMode === TimerMode.WORKING) {
            // Work complete -> transition to break
            transitionToBreak()

            // Emit work complete event
            timerEventEmitter.emit({
              type: TimerEventType.WORK_COMPLETE,
              payload: {
                timestamp: Date.now(),
                duration: WORK_DURATION,
                sessionId: sessionCount,
                phase: 'work',
              },
            })

            // Emit break start event
            timerEventEmitter.emit({
              type: TimerEventType.BREAK_START,
              payload: {
                timestamp: Date.now(),
                duration: BREAK_DURATION,
                sessionId: sessionCount,
                phase: 'break',
              },
            })

            // Reset accumulated time for break phase
            accumulatedTimeRef.current = 0
          } else if (timerMode === TimerMode.BREAK_REMINDER) {
            // Break complete -> transition to idle
            transitionToIdle()

            // Emit break complete event
            timerEventEmitter.emit({
              type: TimerEventType.BREAK_COMPLETE,
              payload: {
                timestamp: Date.now(),
                duration: BREAK_DURATION,
                sessionId: sessionCount + 1, // Session will be incremented by transitionToIdle
                phase: 'break',
              },
            })

            // Stop the timer
            return
          }
        }

        lastUpdateRef.current = now
      }

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(updateTimer)
    }

    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(updateTimer)

    // Emit work start event when timer begins
    if (timerMode === TimerMode.WORKING && elapsedTime === 0) {
      timerEventEmitter.emit({
        type: TimerEventType.WORK_START,
        payload: {
          timestamp: Date.now(),
          duration: WORK_DURATION,
          sessionId: sessionCount,
          phase: 'work',
        },
      })
    }

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [
    isRunning,
    timerMode,
    startTimestamp,
    currentPhase,
    sessionCount,
    elapsedTime,
    updateElapsedTime,
    transitionToBreak,
    transitionToIdle,
  ])

  // Calculate remaining time for UI display
  const getRemainingTime = (): number => {
    const maxDuration = currentPhase === 'work' ? WORK_DURATION : BREAK_DURATION
    const remaining = Math.max(0, maxDuration - elapsedTime)
    return Math.ceil(remaining) // Round up for better UX
  }

  // Calculate progress percentage for ProgressRing
  const getProgressPercentage = (): number => {
    const maxDuration = currentPhase === 'work' ? WORK_DURATION : BREAK_DURATION
    const percentage = (elapsedTime / maxDuration) * 100
    return Math.min(100, Math.max(0, percentage))
  }

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return {
    remainingTime: getRemainingTime(),
    progressPercentage: getProgressPercentage(),
    formattedTime: formatTime(getRemainingTime()),
    timerMode,
    currentPhase,
    sessionCount,
  }
}
