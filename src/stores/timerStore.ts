import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { TimerStore } from '../types'
import { TimerMode } from '../types'

const WORK_DURATION = 1200 // 20 minutes in seconds
export const BREAK_DURATION = 20 // 20 seconds

export const useTimerStore = create<TimerStore>()(
  persist(
    set => ({
      // Legacy fields (preserved for compatibility)
      duration: WORK_DURATION,
      isRunning: false,
      startTime: null,

      // New state machine fields
      timerMode: TimerMode.IDLE,
      elapsedTime: 0,
      sessionCount: 0,
      currentPhase: null,
      startTimestamp: null,

      // Legacy actions (mapped to new state machine behavior)
      start: () =>
        set(() => ({
          timerMode: TimerMode.WORKING,
          isRunning: true,
          currentPhase: 'work' as const,
          elapsedTime: 0,
          startTimestamp: performance.now(),
          startTime: Date.now(),
        })),

      pause: () =>
        set(state => ({
          timerMode: TimerMode.PAUSED,
          isRunning: false,
          elapsedTime: state.elapsedTime,
        })),

      reset: () =>
        set(() => ({
          timerMode: TimerMode.IDLE,
          isRunning: false,
          currentPhase: null,
          elapsedTime: 0,
          startTimestamp: null,
          startTime: null,
        })),

      setDuration: (duration: number) =>
        set(() => ({
          duration,
          isRunning: false,
          startTime: null,
        })),

      // New state machine actions
      startWork: () =>
        set(() => ({
          timerMode: TimerMode.WORKING,
          isRunning: true,
          currentPhase: 'work',
          elapsedTime: 0,
          startTimestamp: performance.now(),
          startTime: Date.now(),
        })),

      startBreak: () =>
        set(() => ({
          timerMode: TimerMode.BREAK_REMINDER,
          isRunning: true,
          currentPhase: 'break',
          elapsedTime: 0,
          startTimestamp: performance.now(),
        })),

      pauseTimer: () =>
        set(state => ({
          timerMode: TimerMode.PAUSED,
          isRunning: false,
          // Preserve elapsed time when pausing
          elapsedTime: state.elapsedTime,
        })),

      resumeTimer: () =>
        set(state => ({
          timerMode:
            state.currentPhase === 'work'
              ? TimerMode.WORKING
              : TimerMode.BREAK_REMINDER,
          isRunning: true,
          startTimestamp: performance.now(), // Reset timestamp for RAF
        })),

      resetTimer: () =>
        set(() => ({
          timerMode: TimerMode.IDLE,
          isRunning: false,
          currentPhase: null,
          elapsedTime: 0,
          startTimestamp: null,
          startTime: null,
        })),

      incrementSession: () =>
        set(state => ({
          sessionCount: state.sessionCount + 1,
        })),

      updateElapsedTime: (elapsed: number) =>
        set(() => ({
          elapsedTime: elapsed,
        })),

      transitionToBreak: () =>
        set(state => {
          // Only transition if currently in WORKING mode
          if (state.timerMode === TimerMode.WORKING) {
            return {
              timerMode: TimerMode.BREAK_REMINDER,
              currentPhase: 'break' as const,
              elapsedTime: 0,
              startTimestamp: performance.now(),
            }
          }
          return state
        }),

      transitionToIdle: () =>
        set(state => {
          // Increment session when completing break
          if (state.timerMode === TimerMode.BREAK_REMINDER) {
            return {
              timerMode: TimerMode.IDLE,
              isRunning: false,
              currentPhase: null,
              elapsedTime: 0,
              startTimestamp: null,
              sessionCount: state.sessionCount + 1,
            }
          }
          return {
            timerMode: TimerMode.IDLE,
            isRunning: false,
            currentPhase: null,
            elapsedTime: 0,
            startTimestamp: null,
          }
        }),
    }),
    {
      name: 'eyecare-timer-storage',
      storage: createJSONStorage(() => {
        try {
          // Test if localStorage is available
          localStorage.setItem('test', 'test')
          localStorage.removeItem('test')
          return localStorage
        } catch {
          // Fallback to in-memory storage for private browsing
          console.warn('localStorage not available, using memory storage')
          const memoryStorage: Record<string, string> = {}
          return {
            getItem: (key: string) => memoryStorage[key] || null,
            setItem: (key: string, value: string) => {
              memoryStorage[key] = value
            },
            removeItem: (key: string) => {
              delete memoryStorage[key]
            },
          }
        }
      }),
      partialize: state => ({
        // Persist only necessary state
        timerMode: state.timerMode,
        elapsedTime: state.elapsedTime,
        sessionCount: state.sessionCount,
        currentPhase: state.currentPhase,
        startTimestamp: state.startTimestamp,
        isRunning: state.isRunning,
      }),
    }
  )
)
