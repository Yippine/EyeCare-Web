/**
 * Statistics Sync Hook
 * Formula: useStatisticsSync = EventBus_Subscription + DataTransformation + StatisticsDB_Write
 *
 * Subscribes to timer/exercise events and automatically records them to StatisticsDB
 */

import { useEffect } from 'react'
import { timerEventEmitter } from '../utils/eventEmitter'
import { TimerEventType } from '../types/events'
import type { TimerEvent } from '../types/events'
import { useStatisticsStore } from '../stores/statisticsStore'
import type { SessionRecord, ExerciseRecord } from '../types/statistics'
import type { ExerciseType } from '../types/exercise'

/**
 * Hook to sync timer/exercise events to statistics database
 * Formula: useStatisticsSync = subscribe(WORK_COMPLETE | BREAK_COMPLETE | EXERCISE_COMPLETE) -> recordToDatabase
 */
export function useStatisticsSync() {
  const { recordSession, recordExercise, initializeDatabase } =
    useStatisticsStore()

  useEffect(() => {
    console.log('[useStatisticsSync] Initializing statistics sync')

    // Initialize database on mount
    initializeDatabase()

    /**
     * Handle WORK_COMPLETE event
     * Formula: WORK_COMPLETE -> SessionRecord -> recordSession
     */
    const handleWorkComplete = (event: TimerEvent) => {
      const { timestamp, duration, sessionId } = event.payload

      const session: Omit<SessionRecord, 'date'> = {
        sessionId: `session-${sessionId}-${timestamp}`,
        startTime: new Date(timestamp - duration * 1000).toISOString(),
        endTime: new Date(timestamp).toISOString(),
        duration,
        completed: true,
      }

      console.log('[useStatisticsSync] Recording work session:', session)
      recordSession(session).catch(error => {
        console.error(
          '[useStatisticsSync] Failed to record work session:',
          error
        )
      })
    }

    /**
     * Handle BREAK_COMPLETE event
     * Formula: BREAK_COMPLETE -> SessionRecord -> recordSession
     */
    const handleBreakComplete = (event: TimerEvent) => {
      const { timestamp, duration, sessionId } = event.payload

      // Record break as a completed session (type: break)
      const session: Omit<SessionRecord, 'date'> = {
        sessionId: `break-${sessionId}-${timestamp}`,
        startTime: new Date(timestamp - duration * 1000).toISOString(),
        endTime: new Date(timestamp).toISOString(),
        duration,
        completed: true,
      }

      console.log('[useStatisticsSync] Recording break session:', session)
      recordSession(session).catch(error => {
        console.error(
          '[useStatisticsSync] Failed to record break session:',
          error
        )
      })
    }

    /**
     * Handle EXERCISE_COMPLETE event
     * Formula: EXERCISE_COMPLETE -> ExerciseRecord -> recordExercise
     */
    const handleExerciseComplete = (event: TimerEvent) => {
      const { timestamp, duration, sessionId, metadata } = event.payload

      // Extract exercise type from metadata
      const exerciseType =
        (metadata?.exerciseType as ExerciseType) || 'blink_exercise'

      const exercise: Omit<ExerciseRecord, 'date'> = {
        exerciseId: `exercise-${sessionId}-${timestamp}`,
        sessionId: `session-${sessionId}`,
        exerciseType,
        completedAt: new Date(timestamp).toISOString(),
        duration,
      }

      console.log('[useStatisticsSync] Recording exercise:', exercise)
      recordExercise(exercise).catch(error => {
        console.error('[useStatisticsSync] Failed to record exercise:', error)
      })
    }

    // Subscribe to events
    const unsubscribeWorkComplete = timerEventEmitter.subscribe(
      TimerEventType.WORK_COMPLETE,
      handleWorkComplete
    )

    const unsubscribeBreakComplete = timerEventEmitter.subscribe(
      TimerEventType.BREAK_COMPLETE,
      handleBreakComplete
    )

    const unsubscribeExerciseComplete = timerEventEmitter.subscribe(
      TimerEventType.EXERCISE_COMPLETE,
      handleExerciseComplete
    )

    console.log('[useStatisticsSync] Event subscriptions established')

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeWorkComplete()
      unsubscribeBreakComplete()
      unsubscribeExerciseComplete()
      console.log('[useStatisticsSync] Event subscriptions cleaned up')
    }
  }, [recordSession, recordExercise, initializeDatabase])
}
