/**
 * Blink Exercise Component
 * Formula: BlinkExercise = EyelidOverlay × BlinkDetector × Counter
 *
 * Implements conscious blinking exercise with visual feedback
 * Scientific basis: Regular blinking prevents dry eye syndrome
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback, useRef } from 'react'
import type { ExerciseProps } from '../../types/exercise'
import type { BlinkState } from '../../types/exercise'
import {
  blinkOverlayVariants,
  gpuAcceleratedStyle,
} from '../../config/animationVariants'
import { useAnimationFeatures } from '../../hooks/useAnimationPerformance'

interface BlinkExerciseProps extends ExerciseProps {
  maxBlinks?: number
}

export const BlinkExercise: React.FC<BlinkExerciseProps> = ({
  onComplete,
  onPause,
  onResume,
  isPaused = false,
  maxBlinks = 10,
}) => {
  const [blinkState, setBlinkState] = useState<BlinkState>({
    blinkCount: 0,
    maxBlinks,
    lastBlinkTime: 0,
    isBlinking: false,
  })
  const [progress, setProgress] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [showPrompt, setShowPrompt] = useState(true)
  const [completed, setCompleted] = useState(false)
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

  const blinkDuration = 300 // 300ms per blink

  // Handle blink trigger
  const triggerBlink = useCallback(() => {
    if (isPaused || blinkState.isBlinking) return

    const now = Date.now()
    // Debounce blinks (minimum 500ms between blinks)
    if (now - blinkState.lastBlinkTime < 500) return

    setBlinkState(prev => ({
      ...prev,
      isBlinking: true,
      lastBlinkTime: now,
    }))

    // Hide prompt temporarily
    setShowPrompt(false)

    // Complete blink animation
    setTimeout(() => {
      setBlinkState(prev => {
        const newCount = prev.blinkCount + 1
        return {
          ...prev,
          blinkCount: newCount,
          isBlinking: false,
        }
      })

      // Show prompt again after delay
      setTimeout(() => setShowPrompt(true), 1000)
    }, blinkDuration)
  }, [isPaused, blinkState.isBlinking, blinkState.lastBlinkTime])

  // Auto-prompt every 2 seconds
  useEffect(() => {
    if (isPaused || blinkState.blinkCount >= maxBlinks) return

    const promptInterval = setInterval(() => {
      setShowPrompt(true)
    }, 2000)

    return () => clearInterval(promptInterval)
  }, [isPaused, blinkState.blinkCount, maxBlinks])

  // Initialize start time once
  useEffect(() => {
    if (!startTime) {
      setStartTime(Date.now())
    }
  }, []) // Run only once on mount

  // Handle pause/resume
  useEffect(() => {
    if (isPaused) {
      if (onPauseRef.current) onPauseRef.current()
    } else {
      if (onResumeRef.current) onResumeRef.current()
    }
  }, [isPaused])

  // Track progress and handle completion
  useEffect(() => {
    // Update progress based on blink count
    const currentProgress = blinkState.blinkCount / maxBlinks
    setProgress(currentProgress)

    // Complete exercise when all blinks done (with completion guard)
    if (blinkState.blinkCount >= maxBlinks && !completed) {
      setCompleted(true)
      if (onCompleteRef.current) onCompleteRef.current()
    }
  }, [blinkState.blinkCount, maxBlinks, completed])

  // Keyboard interaction (spacebar to blink)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        triggerBlink()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [triggerBlink])

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Instructions */}
      <div className="absolute top-8 left-0 right-0 text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Blink Exercise
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Blink slowly and deliberately
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Click the button or press Spacebar to blink
        </p>
      </div>

      {/* Blink counter */}
      <div className="absolute top-32 left-0 right-0 text-center">
        <div className="inline-flex items-center gap-2">
          {Array.from({ length: maxBlinks }).map((_, index) => (
            <motion.div
              key={index}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                index < blinkState.blinkCount
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}
              initial={{ scale: 0.8 }}
              animate={{
                scale: index === blinkState.blinkCount ? 1.1 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {index < blinkState.blinkCount ? '✓' : index + 1}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative">
        {/* Blink prompt */}
        <AnimatePresence>
          {showPrompt &&
            !blinkState.isBlinking &&
            blinkState.blinkCount < maxBlinks && (
              <motion.div
                className="absolute -top-20 left-1/2 -translate-x-1/2 text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 animate-pulse">
                  Blink Now!
                </p>
              </motion.div>
            )}
        </AnimatePresence>

        {/* Eye icon */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Eye outline */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 200 200"
            fill="none"
          >
            {/* Eye shape */}
            <ellipse
              cx="100"
              cy="100"
              rx="80"
              ry="50"
              stroke="currentColor"
              strokeWidth="4"
              className="text-purple-500"
            />
            {/* Iris */}
            <circle
              cx="100"
              cy="100"
              r="30"
              fill="currentColor"
              className="text-purple-500"
            />
            {/* Pupil */}
            <circle
              cx="100"
              cy="100"
              r="15"
              fill="currentColor"
              className="text-gray-900 dark:text-white"
            />
            {/* Highlight */}
            <circle cx="110" cy="90" r="5" fill="white" opacity="0.8" />
          </svg>

          {/* Blink overlay (eyelid) */}
          <AnimatePresence>
            {blinkState.isBlinking && (
              <motion.div
                className="absolute inset-0 bg-purple-600 rounded-full"
                style={gpuAcceleratedStyle}
                variants={prefersReducedMotion ? {} : blinkOverlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Blink button */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2">
          <motion.button
            onClick={triggerBlink}
            disabled={isPaused || blinkState.blinkCount >= maxBlinks}
            className="px-8 py-4 bg-purple-500 text-white rounded-full font-semibold text-lg shadow-lg hover:bg-purple-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {blinkState.blinkCount >= maxBlinks
              ? 'Complete! 🎉'
              : `Blink (${blinkState.blinkCount}/${maxBlinks})`}
          </motion.button>
        </div>
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
            className="h-full bg-purple-500"
            initial={{ width: '0%' }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
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

      {/* Completion celebration */}
      {blinkState.blinkCount >= maxBlinks && (
        <motion.div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl">🎉</div>
        </motion.div>
      )}
    </div>
  )
}
