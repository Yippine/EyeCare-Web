/**
 * Exercise Store
 * Formula: ExerciseStore = ZustandStore × PersistMiddleware × Actions
 *
 * State management for exercise system with localStorage persistence
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { ExerciseState, SelectionState, ExerciseType } from '../types/exercise'
import type {
  ExerciseStore,
  ExerciseCompletion,
  ExercisePreferences,
} from '../types/exercise'
import {
  DEFAULT_EXERCISE_PREFERENCES,
  STORAGE_CONFIG,
  SELECTION_CONFIG,
  selectRandomExercise,
} from '../config/exerciseConfig'

/**
 * Create exercise store with persistence
 * Formula: createStore = state + actions + middleware(persist)
 */
export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentExercise: null,
      exerciseState: ExerciseState.IDLE,
      selectionState: SelectionState.RANDOMIZING,
      history: [],
      completions: [],
      preferences: DEFAULT_EXERCISE_PREFERENCES,
      manualSelectionEndTime: null,

      // Exercise selection actions
      selectExercise: (exerciseType: ExerciseType | null) => {
        set({
          currentExercise: exerciseType,
          selectionState: exerciseType
            ? SelectionState.SELECTED
            : SelectionState.RANDOMIZING,
        })
      },

      selectRandomExercise: () => {
        const { history, preferences } = get()

        // Use preferred exercise if set
        if (preferences.preferredExercise) {
          set({
            currentExercise: preferences.preferredExercise,
            selectionState: SelectionState.SELECTED,
          })
          return
        }

        // Otherwise, select random exercise avoiding recent history
        const selectedExercise = selectRandomExercise(history)
        set({
          currentExercise: selectedExercise,
          selectionState: SelectionState.SELECTED,
        })
      },

      // State management actions
      launchExercise: (exerciseType: ExerciseType) => {
        set({
          currentExercise: exerciseType,
          exerciseState: ExerciseState.LAUNCHING,
          selectionState: SelectionState.SELECTED,
        })

        // Transition to RUNNING after brief launch delay
        setTimeout(() => {
          if (get().exerciseState === ExerciseState.LAUNCHING) {
            set({ exerciseState: ExerciseState.RUNNING })
          }
        }, 300) // 300ms launch animation
      },

      startExercise: () => {
        set({ exerciseState: ExerciseState.RUNNING })
      },

      pauseExercise: () => {
        const { exerciseState } = get()
        if (exerciseState === ExerciseState.RUNNING) {
          set({ exerciseState: ExerciseState.PAUSED })
        }
      },

      resumeExercise: () => {
        const { exerciseState } = get()
        if (exerciseState === ExerciseState.PAUSED) {
          set({ exerciseState: ExerciseState.RUNNING })
        }
      },

      completeExercise: () => {
        const { currentExercise } = get()
        set({ exerciseState: ExerciseState.COMPLETING })

        // Transition to COMPLETED after brief animation
        setTimeout(() => {
          set({
            exerciseState: ExerciseState.COMPLETED,
          })

          // Update history if exercise was completed
          if (currentExercise) {
            get().updateHistory(currentExercise)
          }
        }, 500) // 500ms completion animation
      },

      resetExercise: () => {
        set({
          currentExercise: null,
          exerciseState: ExerciseState.IDLE,
          selectionState: SelectionState.RANDOMIZING,
          manualSelectionEndTime: null,
        })
      },

      // Tracking actions
      trackCompletion: (completion: ExerciseCompletion) => {
        const { completions } = get()
        const updatedCompletions = [...completions, completion].slice(
          -STORAGE_CONFIG.maxCompletions
        ) // Keep last N completions

        set({ completions: updatedCompletions })
      },

      updateHistory: (exerciseType: ExerciseType) => {
        const { history } = get()
        const updatedHistory = [...history, exerciseType].slice(
          -STORAGE_CONFIG.maxHistorySize
        ) // Keep last N history items

        set({ history: updatedHistory })
      },

      // Preferences actions
      setPreferences: (preferences: Partial<ExercisePreferences>) => {
        set(state => ({
          preferences: {
            ...state.preferences,
            ...preferences,
          },
        }))
      },

      // Manual selection window actions
      enableManualSelectionWindow: () => {
        const endTime =
          Date.now() + SELECTION_CONFIG.manualSelectionWindowDuration
        set({
          manualSelectionEndTime: endTime,
          selectionState: SelectionState.MANUAL_OVERRIDE,
        })

        // Auto-disable after window expires
        setTimeout(() => {
          const { manualSelectionEndTime, currentExercise, selectionState } =
            get()
          if (
            manualSelectionEndTime === endTime &&
            selectionState === SelectionState.MANUAL_OVERRIDE
          ) {
            // If no exercise selected, pick random
            if (!currentExercise) {
              get().selectRandomExercise()
            }
            get().disableManualSelectionWindow()
          }
        }, SELECTION_CONFIG.manualSelectionWindowDuration)
      },

      disableManualSelectionWindow: () => {
        set({
          manualSelectionEndTime: null,
          selectionState: SelectionState.SELECTED,
        })
      },
    }),
    {
      name: STORAGE_CONFIG.storageKey,
      storage: createJSONStorage(() => {
        try {
          // Test if localStorage is available
          localStorage.setItem('test', 'test')
          localStorage.removeItem('test')
          return localStorage
        } catch {
          // Fallback to in-memory storage
          console.warn(
            '[ExerciseStore] localStorage not available, using memory storage'
          )
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
        // Persist only necessary state (exclude transient state)
        history: state.history,
        completions: state.completions,
        preferences: state.preferences,
        // Do NOT persist: currentExercise, exerciseState, selectionState, manualSelectionEndTime
      }),
    }
  )
)

/**
 * Selectors for common queries
 */
export const exerciseSelectors = {
  // Get recent completions (last N)
  getRecentCompletions: (state: ExerciseStore, count = 10) => {
    return state.completions.slice(-count)
  },

  // Check if exercise is active
  isExerciseActive: (state: ExerciseStore) => {
    return (
      state.exerciseState === ExerciseState.RUNNING ||
      state.exerciseState === ExerciseState.PAUSED ||
      state.exerciseState === ExerciseState.LAUNCHING
    )
  },

  // Check if manual selection is available
  isManualSelectionAvailable: (state: ExerciseStore) => {
    return (
      state.selectionState === SelectionState.MANUAL_OVERRIDE &&
      state.manualSelectionEndTime !== null &&
      Date.now() < state.manualSelectionEndTime
    )
  },

  // Get completion count for specific exercise type
  getExerciseCompletionCount: (state: ExerciseStore, type: ExerciseType) => {
    return state.completions.filter(c => c.exerciseType === type).length
  },

  // Get total completion count
  getTotalCompletionCount: (state: ExerciseStore) => {
    return state.completions.length
  },
}
