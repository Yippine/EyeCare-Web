/**
 * Exercise Selector Component
 * Formula: ExerciseSelector = RandomSelection × HistoryFilter × ManualOverride
 *
 * Allows manual exercise selection during the first 3 seconds of break
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ExerciseType } from '../../types/exercise'
import { useExerciseStore, exerciseSelectors } from '../../stores/exerciseStore'
import { EXERCISE_DEFINITIONS } from '../../config/exerciseConfig'
import {
  scaleSpringVariants,
  gpuAcceleratedStyle,
} from '../../config/animationVariants'
import { useAnimationFeatures } from '../../hooks/useAnimationPerformance'

interface ExerciseSelectorProps {
  onSelect: (exerciseType: ExerciseType) => void
  show: boolean
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  onSelect,
  show,
}) => {
  const { prefersReducedMotion } = useAnimationFeatures()
  const { currentExercise, selectExercise, manualSelectionEndTime } =
    useExerciseStore()

  const isManualSelectionAvailable = useExerciseStore(
    exerciseSelectors.isManualSelectionAvailable
  )

  const [timeRemaining, setTimeRemaining] = useState(0)

  // Update countdown timer
  useEffect(() => {
    if (!manualSelectionEndTime || !isManualSelectionAvailable) {
      setTimeRemaining(0)
      return
    }

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil((manualSelectionEndTime - Date.now()) / 1000)
      )
      setTimeRemaining(remaining)

      if (remaining > 0) {
        requestAnimationFrame(updateTimer)
      }
    }

    updateTimer()
  }, [manualSelectionEndTime, isManualSelectionAvailable])

  const handleSelect = (exerciseType: ExerciseType) => {
    selectExercise(exerciseType)
    onSelect(exerciseType)
  }

  if (!show || !isManualSelectionAvailable) {
    return null
  }

  const exercises = Object.values(ExerciseType)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
        style={gpuAcceleratedStyle}
        variants={prefersReducedMotion ? {} : scaleSpringVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4"
          variants={prefersReducedMotion ? {} : scaleSpringVariants}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Choose Your Exercise
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Select an exercise or wait for random selection
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {timeRemaining}s remaining
              </span>
            </div>
          </div>

          {/* Exercise cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exercises.map(exerciseType => {
              const metadata = EXERCISE_DEFINITIONS[exerciseType]
              const isSelected = currentExercise === exerciseType

              return (
                <motion.button
                  key={exerciseType}
                  onClick={() => handleSelect(exerciseType)}
                  className={`relative p-6 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Icon */}
                  <div className="text-5xl mb-3">{metadata.icon}</div>

                  {/* Name */}
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    {metadata.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {metadata.description}
                  </p>

                  {/* Duration */}
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{metadata.duration}s</span>
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <motion.div
                      className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Random selection will occur automatically if no exercise is chosen
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
