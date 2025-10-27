/**
 * Near-Far Focus Exercise Component
 * Formula: NearFarFocus = DualTargetRenderer × CycleController × FocusPrompt
 *
 * Implements near-far focus training with 3 complete cycles
 * Scientific basis: Accommodation exercises prevent eye strain from prolonged near-work
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import type { ExerciseProps } from '../../types/exercise'
import { FocusState } from '../../types/exercise'
import {
  nearFarVariants,
  pulseVariants,
  gpuAcceleratedStyle,
} from '../../config/animationVariants'
import { useAnimationFeatures } from '../../hooks/useAnimationPerformance'

interface NearFarFocusProps extends ExerciseProps {
  cycles?: number
}

export const NearFarFocus: React.FC<NearFarFocusProps> = ({
  onComplete,
  onPause,
  onResume,
  duration = 18,
  isPaused = false,
  cycles = 3,
}) => {
  const [currentCycle, setCurrentCycle] = useState(0)
  const [focusState, setFocusState] = useState<FocusState>(FocusState.FAR)
  const [progress, setProgress] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [pausedTime, setPausedTime] = useState<number>(0)
  const { prefersReducedMotion } = useAnimationFeatures()

  // Use refs to store stable callback references
  const onCompleteRef = useRef(onComplete)
  const onPauseRef = useRef(onPause)
  const onResumeRef = useRef(onResume)

  // Update refs when props change
  useEffect(() => {
    onCompleteRef.current = onComplete
    onPauseRef.current = onPause
    onResumeRef.current = onResume
  }, [onComplete, onPause, onResume])

  // Handle cycle progression
  useEffect(() => {
    if (isPaused) {
      if (onPauseRef.current) onPauseRef.current()
      return
    }

    if (!startTime) {
      setStartTime(Date.now())
    }

    if (onResumeRef.current && pausedTime > 0) {
      onResumeRef.current()
    }

    const interval = setInterval(() => {
      if (!startTime || isPaused) return

      const elapsed = (Date.now() - startTime - pausedTime) / 1000
      const currentProgress = Math.min(elapsed / duration, 1)
      setProgress(currentProgress)

      // Calculate current cycle and focus state
      const totalFocusStates = cycles * 2 // Each cycle has 2 states (near + far)
      const currentStateIndex = Math.floor(
        (elapsed / duration) * totalFocusStates
      )
      const newCycle = Math.floor(currentStateIndex / 2)
      const newFocusState =
        currentStateIndex % 2 === 0 ? FocusState.FAR : FocusState.NEAR

      if (newCycle !== currentCycle) {
        setCurrentCycle(newCycle)
      }

      if (newFocusState !== focusState) {
        setFocusState(newFocusState)
      }

      // Complete exercise
      if (currentProgress >= 1) {
        clearInterval(interval)
        if (onCompleteRef.current) onCompleteRef.current()
      }
    }, 100)

    return () => clearInterval(interval)
  }, [
    isPaused,
    startTime,
    pausedTime,
    duration,
    cycles,
    currentCycle,
    focusState,
  ])

  // Handle pause time tracking
  useEffect(() => {
    if (isPaused && startTime) {
      const pauseStart = Date.now()
      return () => {
        setPausedTime(prev => prev + (Date.now() - pauseStart))
      }
    }
  }, [isPaused, startTime])

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Instructions */}
      <div className="absolute top-8 left-0 right-0 text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Near-Far Focus Exercise
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Focus on the target when instructed
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Cycle {currentCycle + 1} of {cycles}
        </p>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-8 left-8 right-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm font-medium text-gray-800 dark:text-white">
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-green-500"
            initial={{ width: '0%' }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* Focus target */}
      <div className="relative">
        {/* Visual prompt */}
        <AnimatePresence mode="wait">
          <motion.div
            key={focusState}
            className="absolute -top-24 left-1/2 -translate-x-1/2 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
              {focusState === FocusState.NEAR ? 'Focus NEAR' : 'Focus FAR'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {focusState === FocusState.NEAR
                ? 'Look at the small circle'
                : 'Look at the large circle'}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Animated target */}
        <motion.div
          className="relative w-64 h-64 flex items-center justify-center"
          style={gpuAcceleratedStyle}
        >
          {/* Outer circle (far focus) */}
          <motion.div
            className="absolute inset-0 rounded-full border-8 border-green-500 flex items-center justify-center"
            variants={prefersReducedMotion ? {} : nearFarVariants}
            animate={focusState === FocusState.FAR ? 'far' : 'near'}
            style={{
              boxShadow:
                focusState === FocusState.FAR
                  ? '0 0 40px rgba(34, 197, 94, 0.6)'
                  : 'none',
            }}
          >
            {focusState === FocusState.FAR && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-green-400"
                variants={pulseVariants}
                animate="pulse"
              />
            )}
          </motion.div>

          {/* Center target */}
          <motion.div
            className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center"
            variants={prefersReducedMotion ? {} : nearFarVariants}
            animate={focusState === FocusState.NEAR ? 'near' : 'far'}
            style={{
              boxShadow:
                focusState === FocusState.NEAR
                  ? '0 0 40px rgba(34, 197, 94, 0.6)'
                  : '0 4px 20px rgba(34, 197, 94, 0.3)',
            }}
          >
            {/* Inner circle (near focus) */}
            <motion.div
              className="w-16 h-16 rounded-full bg-green-400"
              style={{
                boxShadow: '0 0 20px rgba(74, 222, 128, 0.5)',
              }}
            >
              {focusState === FocusState.NEAR && (
                <motion.div
                  className="w-full h-full rounded-full border-2 border-white"
                  variants={pulseVariants}
                  animate="pulse"
                />
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Cycle indicators */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
          {Array.from({ length: cycles }).map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index < currentCycle
                  ? 'bg-green-500'
                  : index === currentCycle
                    ? 'bg-green-400 ring-2 ring-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Pause indicator */}
      {isPaused && (
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg px-8 py-4 shadow-xl">
            <p className="text-xl font-semibold text-gray-800 dark:text-white">
              Paused
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
