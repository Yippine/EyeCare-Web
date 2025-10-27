/**
 * Exercise Overlay Component
 * Formula: ExerciseOverlay = FullscreenContainer × ExerciseRenderer × UIControls
 *
 * Fullscreen overlay that displays the active exercise
 * Lazy loads exercise components for optimal bundle size
 */

import { motion, AnimatePresence } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { ExerciseType, ExerciseState } from '../../types/exercise'
import { useExerciseStore, exerciseSelectors } from '../../stores/exerciseStore'
import {
  fadeVariants,
  gpuAcceleratedStyle,
} from '../../config/animationVariants'
import { useAnimationFeatures } from '../../hooks/useAnimationPerformance'
import { ExerciseSelector } from './ExerciseSelector'

// Lazy load exercise components for bundle optimization
const BallTracking = lazy(() =>
  import('./BallTracking').then(module => ({
    default: module.BallTracking,
  }))
)

const NearFarFocus = lazy(() =>
  import('./NearFarFocus').then(module => ({
    default: module.NearFarFocus,
  }))
)

const BlinkExercise = lazy(() =>
  import('./BlinkExercise').then(module => ({
    default: module.BlinkExercise,
  }))
)

interface ExerciseOverlayProps {
  isVisible: boolean
  onClose?: () => void
}

export const ExerciseOverlay: React.FC<ExerciseOverlayProps> = ({
  isVisible,
  onClose,
}) => {
  const { prefersReducedMotion } = useAnimationFeatures()
  const {
    currentExercise,
    exerciseState,
    completeExercise,
    resetExercise,
    pauseExercise,
    resumeExercise,
    launchExercise,
  } = useExerciseStore()

  const isExerciseActive = useExerciseStore(exerciseSelectors.isExerciseActive)
  const isManualSelectionAvailable = useExerciseStore(
    exerciseSelectors.isManualSelectionAvailable
  )

  const isPaused = exerciseState === ExerciseState.PAUSED

  // Handle exercise completion
  const handleComplete = () => {
    completeExercise()
    // Close overlay after 3 seconds (auto-close)
    setTimeout(() => {
      resetExercise()
      if (onClose) onClose()
    }, 3000)
  }

  // Handle manual completion dismiss
  const handleCompletionDismiss = () => {
    resetExercise()
    if (onClose) onClose()
  }

  // Handle manual exercise selection
  const handleExerciseSelect = (exerciseType: ExerciseType) => {
    launchExercise(exerciseType)
  }

  // Handle close button
  const handleClose = () => {
    resetExercise()
    if (onClose) onClose()
  }

  // Render exercise component based on type
  const renderExercise = () => {
    if (!currentExercise || !isExerciseActive) return null

    const commonProps = {
      onComplete: handleComplete,
      onPause: pauseExercise,
      onResume: resumeExercise,
      isPaused,
      reducedMotion: prefersReducedMotion,
    }

    switch (currentExercise) {
      case ExerciseType.BALL_TRACKING:
        return <BallTracking {...commonProps} />
      case ExerciseType.NEAR_FAR_FOCUS:
        return <NearFarFocus {...commonProps} />
      case ExerciseType.BLINK_EXERCISE:
        return <BlinkExercise {...commonProps} />
      default:
        return null
    }
  }

  // Loading fallback
  const LoadingFallback = () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading exercise...</p>
      </div>
    </div>
  )

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] bg-white dark:bg-gray-900 overflow-hidden"
        style={gpuAcceleratedStyle}
        variants={prefersReducedMotion ? {} : fadeVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Close button */}
        <motion.button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Close exercise"
        >
          <svg
            className="w-6 h-6 text-gray-600 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </motion.button>

        {/* Pause/Resume button (when exercise is active) */}
        {isExerciseActive && (
          <motion.button
            onClick={isPaused ? resumeExercise : pauseExercise}
            className="absolute top-4 left-4 z-10 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPaused ? (
              <>
                <svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Resume
                </span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 text-gray-600 dark:text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Pause
                </span>
              </>
            )}
          </motion.button>
        )}

        {/* Exercise content */}
        <div className="w-full h-full overflow-hidden">
          <Suspense fallback={<LoadingFallback />}>{renderExercise()}</Suspense>
        </div>

        {/* Exercise selector (manual selection window) */}
        <ExerciseSelector
          show={isManualSelectionAvailable && !isExerciseActive}
          onSelect={handleExerciseSelect}
        />

        {/* Completion celebration */}
        <AnimatePresence>
          {exerciseState === ExerciseState.COMPLETED && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl px-12 py-8 shadow-2xl text-center"
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {/* Celebration icon */}
                <div className="text-6xl mb-4">🎉</div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  Well Done!
                </h3>

                {/* Message */}
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Exercise completed successfully
                </p>

                {/* Continue button */}
                <motion.button
                  onClick={handleCompletionDismiss}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue
                </motion.button>

                {/* Auto-close hint */}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                  Auto-closing in 3 seconds...
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
