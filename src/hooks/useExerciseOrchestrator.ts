/**
 * Exercise Orchestrator Hook
 * Formula: Orchestrator = TimerListener × StateManager × CompletionHandler
 *
 * Orchestrates exercise system integration with timer
 * Handles automatic exercise launch on break start
 */

import { useEffect, useRef, useCallback } from 'react'
import { useTimerStore } from '../stores/timerStore'
import { useExerciseStore, exerciseSelectors } from '../stores/exerciseStore'
import { TimerMode } from '../types'
import { ExerciseState, ExerciseType } from '../types/exercise'
import { timerEventEmitter } from '../utils/eventEmitter'
import { TimerEventType } from '../types/events'

/**
 * Hook to orchestrate exercise system
 * Returns isExerciseOverlayVisible flag for UI rendering
 */
export const useExerciseOrchestrator = () => {
  const timerMode = useTimerStore(state => state.timerMode)
  const sessionCount = useTimerStore(state => state.sessionCount)

  const {
    currentExercise,
    exerciseState,
    preferences,
    selectRandomExercise,
    pauseExercise,
    resumeExercise,
    completeExercise,
    resetExercise,
    trackCompletion,
    enableManualSelectionWindow,
  } = useExerciseStore()

  const isExerciseActive = useExerciseStore(exerciseSelectors.isExerciseActive)

  const previousTimerMode = useRef<TimerMode>(timerMode)
  const exerciseStartTime = useRef<number | null>(null)
  const hasLaunchedForBreak = useRef<boolean>(false)

  /**
   * Handle break start - launch exercise automatically
   * Formula: BREAK_REMINDER -> (manualSelection | autoLaunch)
   */
  const handleBreakStart = useCallback(() => {
    // Prevent double-launch
    if (hasLaunchedForBreak.current) return

    hasLaunchedForBreak.current = true

    if (preferences.autoLaunch) {
      // Enable manual selection window first (3 seconds)
      if (preferences.enableManualSelection) {
        enableManualSelectionWindow()
      }

      // Select random exercise (or use preferred)
      selectRandomExercise()

      // If no manual selection within 3s, auto-launch will occur
      // This is handled by the store's enableManualSelectionWindow timer
    }
  }, [
    preferences.autoLaunch,
    preferences.enableManualSelection,
    selectRandomExercise,
    enableManualSelectionWindow,
  ])

  /**
   * Handle exercise completion
   * Formula: exerciseComplete -> trackCompletion + emitEvent
   */
  const handleExerciseComplete = useCallback(() => {
    if (!currentExercise || !exerciseStartTime.current) return

    const duration = (Date.now() - exerciseStartTime.current) / 1000

    // Track completion
    trackCompletion({
      exerciseType: currentExercise,
      completionTimestamp: Date.now(),
      duration: Math.round(duration),
      sessionId: sessionCount,
    })

    // Emit completion event
    timerEventEmitter.emit({
      type: TimerEventType.EXERCISE_COMPLETE,
      payload: {
        timestamp: Date.now(),
        duration: Math.round(duration),
        sessionId: sessionCount,
        phase: 'exercise',
        metadata: {
          exerciseType: currentExercise,
        },
      },
    })

    exerciseStartTime.current = null
  }, [currentExercise, sessionCount, trackCompletion])

  /**
   * Listen to timer mode changes
   */
  useEffect(() => {
    // Break started
    if (
      timerMode === TimerMode.BREAK_REMINDER &&
      previousTimerMode.current !== TimerMode.BREAK_REMINDER
    ) {
      handleBreakStart()
    }

    // Break ended (transition to IDLE)
    if (
      timerMode === TimerMode.IDLE &&
      previousTimerMode.current === TimerMode.BREAK_REMINDER
    ) {
      // Reset for next break
      hasLaunchedForBreak.current = false

      // If exercise is still active, complete it
      if (isExerciseActive) {
        completeExercise()
      }
    }

    // Timer paused
    if (
      timerMode === TimerMode.PAUSED &&
      previousTimerMode.current !== TimerMode.PAUSED
    ) {
      if (isExerciseActive && exerciseState === ExerciseState.RUNNING) {
        pauseExercise()
      }
    }

    // Timer resumed
    if (
      timerMode !== TimerMode.PAUSED &&
      previousTimerMode.current === TimerMode.PAUSED
    ) {
      if (isExerciseActive && exerciseState === ExerciseState.PAUSED) {
        resumeExercise()
      }
    }

    previousTimerMode.current = timerMode
  }, [
    timerMode,
    isExerciseActive,
    exerciseState,
    handleBreakStart,
    pauseExercise,
    resumeExercise,
    completeExercise,
  ])

  /**
   * Track exercise start time
   */
  useEffect(() => {
    if (exerciseState === ExerciseState.RUNNING && !exerciseStartTime.current) {
      exerciseStartTime.current = Date.now()
    }
  }, [exerciseState])

  /**
   * Handle exercise state changes
   */
  useEffect(() => {
    if (exerciseState === ExerciseState.COMPLETED) {
      handleExerciseComplete()
    }
  }, [exerciseState, handleExerciseComplete])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Reset exercise state when component unmounts
      if (isExerciseActive) {
        resetExercise()
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Determine if overlay should be visible
   * Formula: isVisible = (BREAK_REMINDER & (manualSelection | exerciseActive))
   */
  const isExerciseOverlayVisible =
    timerMode === TimerMode.BREAK_REMINDER &&
    (isExerciseActive ||
      exerciseState === ExerciseState.LAUNCHING ||
      exerciseState === ExerciseState.COMPLETED)

  return {
    isExerciseOverlayVisible,
    currentExercise,
    exerciseState,
    isExerciseActive,
  }
}

/**
 * Hook for manual exercise launch (for testing or settings)
 */
export const useManualExerciseLaunch = () => {
  const { launchExercise, selectExercise } = useExerciseStore()

  const launchSpecificExercise = useCallback(
    (exerciseType: ExerciseType) => {
      selectExercise(exerciseType)
      launchExercise(exerciseType)
    },
    [selectExercise, launchExercise]
  )

  return {
    launchSpecificExercise,
  }
}
