/**
 * Exercise Configuration
 * Formula: ExerciseConfig = ExerciseMetadata + DefaultPreferences + StorageConfig
 *
 * This file defines configuration for exercise system
 */

import { ExerciseType } from '../types/exercise'
import type { ExercisePreferences } from '../types/exercise'

/**
 * Exercise metadata
 */
export interface ExerciseMetadata {
  id: ExerciseType
  name: string
  description: string
  duration: number // seconds
  icon: string
  scientificBasis: string
}

/**
 * Exercise definitions with metadata
 * Formula: ExerciseDefinitions = {BallTracking, NearFarFocus, BlinkExercise}
 */
export const EXERCISE_DEFINITIONS: Record<ExerciseType, ExerciseMetadata> = {
  [ExerciseType.BALL_TRACKING]: {
    id: ExerciseType.BALL_TRACKING,
    name: 'Ball Tracking',
    description:
      'Follow the moving ball with your eyes to exercise eye muscles and improve tracking ability',
    duration: 20,
    icon: '⚽',
    scientificBasis:
      'Far-point focusing reduces ciliary muscle strain from near-work',
  },
  [ExerciseType.NEAR_FAR_FOCUS]: {
    id: ExerciseType.NEAR_FAR_FOCUS,
    name: 'Near-Far Focus',
    description:
      'Alternate focusing between near and far targets to train eye accommodation',
    duration: 18,
    icon: '🎯',
    scientificBasis:
      'Accommodation exercises prevent eye strain from prolonged near-work',
  },
  [ExerciseType.BLINK_EXERCISE]: {
    id: ExerciseType.BLINK_EXERCISE,
    name: 'Blink Exercise',
    description:
      'Conscious blinking helps prevent dry eyes and refresh tear film',
    duration: 20,
    icon: '👁️',
    scientificBasis:
      'Regular blinking prevents dry eye syndrome and maintains tear film quality',
  },
}

/**
 * Default exercise preferences
 * Formula: DefaultPreferences = autoLaunch(true) + reducedMotion(detect) + preferredExercise(null)
 */
export const DEFAULT_EXERCISE_PREFERENCES: ExercisePreferences = {
  preferredExercise: null, // Random by default
  autoLaunch: true,
  reducedMotion: false, // Will be detected at runtime
  enableManualSelection: true,
}

/**
 * Exercise selection configuration
 */
export const SELECTION_CONFIG = {
  // Manual selection window duration (first N seconds of break)
  manualSelectionWindowDuration: 3000, // 3 seconds in milliseconds

  // History size for randomization (no repeats in last N exercises)
  // With 3 exercises, historySize=2 ensures better distribution
  historySize: 2,

  // Minimum time between same exercise (sessions)
  minRepeatInterval: 3,
}

/**
 * Storage configuration
 * Formula: StorageConfig = storageKey + maxCompletions + maxHistorySize
 */
export const STORAGE_CONFIG = {
  storageKey: 'eyecare-exercises',
  maxCompletions: 100, // Keep last 100 completions (~3KB)
  maxHistorySize: 50, // Keep last 50 exercises (~1KB)
  maxStorageSize: 5 * 1024, // 5KB total budget
}

/**
 * Animation configuration for each exercise
 */
export const EXERCISE_ANIMATION_CONFIG = {
  [ExerciseType.BALL_TRACKING]: {
    duration: 20,
    paths: ['horizontal', 'vertical', 'circular', 'figure8'] as const,
    ballSize: 60, // pixels
    ballColor: '#3b82f6', // blue-500
  },
  [ExerciseType.NEAR_FAR_FOCUS]: {
    duration: 18,
    cycles: 3,
    cycleDuration: 6,
    nearScale: 0.5,
    farScale: 1.5,
    transitionDuration: 0.8,
  },
  [ExerciseType.BLINK_EXERCISE]: {
    duration: 20,
    maxBlinks: 10,
    blinkDuration: 0.3,
    promptInterval: 2,
    overlayOpacity: 0.8,
  },
}

/**
 * Get all available exercises
 */
export const getAvailableExercises = (): ExerciseType[] => {
  return Object.values(ExerciseType)
}

/**
 * Get exercise metadata by type
 */
export const getExerciseMetadata = (
  type: ExerciseType
): ExerciseMetadata | null => {
  return EXERCISE_DEFINITIONS[type] || null
}

/**
 * Get random exercise excluding recent history
 * Formula: selectRandom(availableExercises - history) -> ExerciseType
 */
export const selectRandomExercise = (history: ExerciseType[]): ExerciseType => {
  const allExercises = getAvailableExercises()

  // Filter out exercises in recent history
  const recentHistory = history.slice(-SELECTION_CONFIG.historySize)
  const availableExercises = allExercises.filter(
    exercise => !recentHistory.includes(exercise)
  )

  // If all exercises are in history, reset and allow any exercise
  const selectionPool =
    availableExercises.length > 0 ? availableExercises : allExercises

  // Select random exercise
  const randomIndex = Math.floor(Math.random() * selectionPool.length)
  return selectionPool[randomIndex]
}

/**
 * Validate exercise preferences
 */
export const validatePreferences = (
  preferences: Partial<ExercisePreferences>
): boolean => {
  if (
    preferences.preferredExercise &&
    !getAvailableExercises().includes(preferences.preferredExercise)
  ) {
    return false
  }
  return true
}

/**
 * Get exercise duration
 */
export const getExerciseDuration = (type: ExerciseType): number => {
  const metadata = getExerciseMetadata(type)
  return metadata?.duration || 20
}

/**
 * Calculate storage size estimate
 * Formula: estimateStorageSize(completions, history) -> bytes
 */
export const estimateStorageSize = (
  completionsCount: number,
  historyCount: number
): number => {
  const completionSize = 80 // bytes per completion
  const historyItemSize = 20 // bytes per history item
  const preferencesSize = 100 // bytes for preferences
  const metadataSize = 50 // bytes for metadata

  return (
    completionsCount * completionSize +
    historyCount * historyItemSize +
    preferencesSize +
    metadataSize
  )
}
