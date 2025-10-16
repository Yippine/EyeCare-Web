/**
 * Exercise Type Definitions
 * Formula: ExerciseTypes = ExerciseType + CompletionData + ExerciseHistory + ExercisePreferences + ExerciseState
 */

/**
 * Available exercise types
 */
export enum ExerciseType {
  BALL_TRACKING = 'ball_tracking',
  NEAR_FAR_FOCUS = 'near_far_focus',
  BLINK_EXERCISE = 'blink_exercise',
}

/**
 * Exercise execution state machine
 * Formula: S_exercise = IDLE | LAUNCHING | RUNNING | PAUSED | COMPLETING | COMPLETED
 */
export enum ExerciseState {
  IDLE = 'IDLE',
  LAUNCHING = 'LAUNCHING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETING = 'COMPLETING',
  COMPLETED = 'COMPLETED',
}

/**
 * Exercise selection state
 * Formula: S_selection = RANDOMIZING | MANUAL_OVERRIDE | SELECTED
 */
export enum SelectionState {
  RANDOMIZING = 'RANDOMIZING',
  MANUAL_OVERRIDE = 'MANUAL_OVERRIDE',
  SELECTED = 'SELECTED',
}

/**
 * Exercise completion data
 * Formula: D_tracking = {exerciseType, completionTimestamp, duration, sessionId}
 */
export interface ExerciseCompletion {
  exerciseType: ExerciseType
  completionTimestamp: number // Unix timestamp
  duration: number // Seconds (~20)
  sessionId: number
}

/**
 * Exercise history for randomization
 * Formula: D_history = {history: Array<exerciseType>} (|history| <= 5)
 */
export interface ExerciseHistory {
  history: ExerciseType[] // Max 5 items
}

/**
 * User exercise preferences
 * Formula: D_preferences = {preferredExercise, autoLaunch, reducedMotion}
 */
export interface ExercisePreferences {
  preferredExercise: ExerciseType | null
  autoLaunch: boolean
  reducedMotion: boolean
  enableManualSelection: boolean
}

/**
 * Exercise store state
 * Formula: ExerciseStoreState = currentExercise + exerciseState + history + completions + preferences
 */
export interface ExerciseStoreState {
  // Current exercise execution
  currentExercise: ExerciseType | null
  exerciseState: ExerciseState
  selectionState: SelectionState

  // History and tracking
  history: ExerciseType[]
  completions: ExerciseCompletion[]

  // User preferences
  preferences: ExercisePreferences

  // Manual selection window
  manualSelectionEndTime: number | null // Timestamp when manual selection window expires
}

/**
 * Exercise store actions
 * Formula: ExerciseActions = selectExercise + trackCompletion + updateHistory + setPreferences + stateTransitions
 */
export interface ExerciseStoreActions {
  // Exercise selection
  selectExercise: (exerciseType: ExerciseType | null) => void
  selectRandomExercise: () => void

  // State management
  launchExercise: (exerciseType: ExerciseType) => void
  startExercise: () => void
  pauseExercise: () => void
  resumeExercise: () => void
  completeExercise: () => void
  resetExercise: () => void

  // Tracking
  trackCompletion: (completion: ExerciseCompletion) => void
  updateHistory: (exerciseType: ExerciseType) => void

  // Preferences
  setPreferences: (preferences: Partial<ExercisePreferences>) => void

  // Manual selection window
  enableManualSelectionWindow: () => void
  disableManualSelectionWindow: () => void
}

/**
 * Complete exercise store
 * Formula: ExerciseStore = ExerciseStoreState + ExerciseStoreActions
 */
export type ExerciseStore = ExerciseStoreState & ExerciseStoreActions

/**
 * Exercise component props
 */
export interface ExerciseProps {
  onComplete?: () => void
  onPause?: () => void
  onResume?: () => void
  duration?: number // Override default duration
  isPaused?: boolean
  reducedMotion?: boolean
}

/**
 * Ball tracking animation paths
 */
export enum BallTrackingPath {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  CIRCULAR = 'circular',
  FIGURE_EIGHT = 'figure8',
}

/**
 * Near-far focus states
 */
export enum FocusState {
  NEAR = 'near',
  FAR = 'far',
  TRANSITION = 'transition',
}

/**
 * Blink exercise state
 */
export interface BlinkState {
  blinkCount: number
  maxBlinks: number
  lastBlinkTime: number
  isBlinking: boolean
}
