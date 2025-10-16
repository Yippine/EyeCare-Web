/**
 * Ball Tracking Exercise Component
 * Formula: BallTracking = PathGenerator × MotionComponent × ProgressTracker
 *
 * Implements smooth ball tracking animation with randomized paths
 * Scientific basis: Far-point focusing reduces ciliary muscle strain
 */

import { motion, useAnimation } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'
import type { ExerciseProps } from '../../types/exercise'
import { BallTrackingPath } from '../../types/exercise'
import { gpuAcceleratedStyle } from '../../config/animationVariants'
import { useAnimationFeatures } from '../../hooks/useAnimationPerformance'

/**
 * Generate animation path based on path type
 * Formula: generatePath(pathType) -> keyframes
 */
const generatePath = (pathType: BallTrackingPath) => {
  const centerX = 50
  const centerY = 50
  const amplitude = 35 // Move within 15-85% range

  switch (pathType) {
    case BallTrackingPath.HORIZONTAL:
      return {
        x: [
          `${centerX - amplitude}%`,
          `${centerX + amplitude}%`,
          `${centerX - amplitude}%`,
        ],
        y: [`${centerY}%`, `${centerY}%`, `${centerY}%`],
      }

    case BallTrackingPath.VERTICAL:
      return {
        x: [`${centerX}%`, `${centerX}%`, `${centerX}%`],
        y: [
          `${centerY - amplitude}%`,
          `${centerY + amplitude}%`,
          `${centerY - amplitude}%`,
        ],
      }

    case BallTrackingPath.CIRCULAR:
      return {
        x: [
          `${centerX}%`,
          `${centerX + amplitude}%`,
          `${centerX}%`,
          `${centerX - amplitude}%`,
          `${centerX}%`,
        ],
        y: [
          `${centerY - amplitude}%`,
          `${centerY}%`,
          `${centerY + amplitude}%`,
          `${centerY}%`,
          `${centerY - amplitude}%`,
        ],
      }

    case BallTrackingPath.FIGURE_EIGHT:
      return {
        x: [
          `${centerX}%`,
          `${centerX + amplitude * 0.7}%`,
          `${centerX}%`,
          `${centerX - amplitude * 0.7}%`,
          `${centerX}%`,
        ],
        y: [
          `${centerY}%`,
          `${centerY - amplitude * 0.5}%`,
          `${centerY}%`,
          `${centerY + amplitude * 0.5}%`,
          `${centerY}%`,
        ],
      }

    default:
      return generatePath(BallTrackingPath.HORIZONTAL)
  }
}

interface BallTrackingProps extends ExerciseProps {
  pathType?: BallTrackingPath
}

export const BallTracking: React.FC<BallTrackingProps> = ({
  onComplete,
  onPause,
  onResume,
  duration = 20,
  isPaused = false,
  pathType,
}) => {
  const controls = useAnimation()
  const [progress, setProgress] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [pausedTime, setPausedTime] = useState<number>(0)
  const { prefersReducedMotion } = useAnimationFeatures()

  // Select random path type if not specified
  const selectedPath = useMemo(() => {
    if (pathType) return pathType

    const paths = Object.values(BallTrackingPath)
    return paths[Math.floor(Math.random() * paths.length)]
  }, [pathType])

  const path = useMemo(() => generatePath(selectedPath), [selectedPath])

  // Handle animation lifecycle
  useEffect(() => {
    if (isPaused) {
      controls.stop()
      if (onPause) onPause()
      return
    }

    // Start or resume animation
    if (!startTime) {
      setStartTime(Date.now())
    }

    if (onResume && pausedTime > 0) {
      onResume()
    }

    const animationDuration = prefersReducedMotion ? 2 : duration

    controls.start({
      x: path.x,
      y: path.y,
      transition: {
        duration: animationDuration * (1 - progress), // Adjust for paused time
        ease: 'linear',
        repeat: 0,
      },
    })

    // Track progress
    const progressInterval = setInterval(() => {
      if (startTime && !isPaused) {
        const elapsed = (Date.now() - startTime - pausedTime) / 1000
        const currentProgress = Math.min(elapsed / duration, 1)
        setProgress(currentProgress)

        if (currentProgress >= 1) {
          clearInterval(progressInterval)
          if (onComplete) onComplete()
        }
      }
    }, 100)

    return () => {
      clearInterval(progressInterval)
    }
  }, [
    isPaused,
    controls,
    path,
    duration,
    startTime,
    pausedTime,
    progress,
    onComplete,
    onPause,
    onResume,
    prefersReducedMotion,
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
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      {/* Instructions */}
      <div className="absolute top-8 left-0 right-0 text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Ball Tracking Exercise
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Follow the moving ball with your eyes only
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Keep your head still and track the ball smoothly
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
            className="h-full bg-blue-500"
            initial={{ width: '0%' }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* Tracking ball */}
      <motion.div
        className="absolute"
        style={{
          ...gpuAcceleratedStyle,
          left: '50%',
          top: '50%',
          marginLeft: '-30px',
          marginTop: '-30px',
        }}
        initial={{ x: path.x[0], y: path.y[0], scale: 1 }}
        animate={controls}
      >
        <div
          className="w-16 h-16 rounded-full bg-blue-500 shadow-lg flex items-center justify-center"
          style={{
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.5)',
          }}
        >
          <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-white opacity-50" />
          </div>
        </div>
      </motion.div>

      {/* Path indicator (subtle) */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg className="w-full h-full">
          <motion.circle
            cx="50%"
            cy="50%"
            r="35%"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-blue-500"
            strokeDasharray={
              selectedPath === BallTrackingPath.CIRCULAR ? '0' : '8 8'
            }
          />
        </svg>
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
