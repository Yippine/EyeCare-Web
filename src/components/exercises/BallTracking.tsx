/**
 * Ball Tracking Exercise Component
 * Formula: BallTracking = PhysicsEngine × MotionComponent × ProgressTracker
 *
 * Implements physics-based ball tracking with random bounces
 * Scientific basis: Far-point focusing reduces ciliary muscle strain
 *
 * Performance Optimizations:
 * - Ref-based state management (避免 re-render)
 * - GPU-accelerated rendering (controls.set)
 * - Delta time normalization (恆速運動)
 * - Enabled performance monitoring
 */

import { motion, useAnimationFrame, useMotionValue } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { ExerciseProps } from '../../types/exercise'
import { gpuAcceleratedStyle } from '../../config/animationVariants'
import { useAnimationFeatures } from '../../hooks/useAnimationPerformance'

// ============================================================
// Physics Configuration
// ============================================================

/**
 * Ball size configuration
 * Ball is w-16 h-16 = 64px, radius = 32px
 */
const BALL_RADIUS = 32 // px (half of w-16 h-16 = 64px)

/**
 * Physics configuration
 * Formula: speed = 440 px/s (2x from 220 px/s, ~3x from original 150 px/s)
 * Range: 400-500 px/s
 */
const BALL_SPEED = 440 // px/s

/**
 * Safety margins for ball movement (accounting for ball radius)
 * Formula: SafetyMargins = {left, right, top, bottom} + BALL_RADIUS
 * This ensures the entire ball stays within viewport
 */
const SAFETY_MARGINS = {
  left: BALL_RADIUS + 8, // 32 + 8 = 40px total margin
  right: BALL_RADIUS + 8,
  top: BALL_RADIUS + 8,
  bottom: 120 + BALL_RADIUS, // Extra space for progress bar + ball radius
}

/**
 * Ball state interface
 * Formula: BallState = {x, y, vx, vy, speed}
 */
interface BallState {
  x: number // Current x position (px)
  y: number // Current y position (px)
  vx: number // Velocity x component (px/s)
  vy: number // Velocity y component (px/s)
  speed: number // Constant speed magnitude (px/s)
}

/**
 * Physics bounds interface
 * Formula: PhysicsBounds = {left, right, top, bottom}
 */
interface PhysicsBounds {
  left: number
  right: number
  top: number
  bottom: number
}

// ============================================================
// Physics Engine Functions
// ============================================================

/**
 * Calculate physics bounds from window size
 * Formula: calculateBounds(window) -> PhysicsBounds
 */
const calculateBounds = (): PhysicsBounds => {
  return {
    left: SAFETY_MARGINS.left,
    right: window.innerWidth - SAFETY_MARGINS.right,
    top: SAFETY_MARGINS.top,
    bottom: window.innerHeight - SAFETY_MARGINS.bottom,
  }
}

/**
 * Initialize ball with random position and direction
 * Formula: initializeBall(bounds) -> BallState
 */
const initializeBall = (bounds: PhysicsBounds): BallState => {
  const x = bounds.left + Math.random() * (bounds.right - bounds.left)
  const y = bounds.top + Math.random() * (bounds.bottom - bounds.top)
  const angle = Math.random() * 2 * Math.PI

  return {
    x,
    y,
    vx: Math.cos(angle) * BALL_SPEED,
    vy: Math.sin(angle) * BALL_SPEED,
    speed: BALL_SPEED,
  }
}

/**
 * Physics functions are inlined in useAnimationFrame for performance
 * Formula: updatePosition = position += velocity × deltaTime (inline)
 * Formula: detectCollision = boundary checks (inline)
 * Formula: calculateBounce = reflection × deviation × normalization (inline)
 */

export const BallTracking: React.FC<ExerciseProps> = ({
  onComplete,
  duration = 20,
  isPaused = false,
}) => {
  useAnimationFeatures(true) // Enable performance monitoring

  // Progress tracking state (for percentage display only)
  const [progress, setProgress] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [pausedTime, setPausedTime] = useState<number>(0)

  // Use refs to store stable callback references (避免 useEffect 依賴)
  const onCompleteRef = useRef(onComplete)

  // Physics state (using refs to avoid re-renders)
  const ballStateRef = useRef<BallState | null>(null)
  const boundsRef = useRef<PhysicsBounds>(calculateBounds())

  // Motion values for GPU-accelerated rendering
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Progress tracking (for percentage display)
  useEffect(() => {
    if (isPaused) return

    if (!startTime) {
      setStartTime(Date.now())
    }

    const interval = setInterval(() => {
      if (!startTime || isPaused) return

      const elapsed = (Date.now() - startTime - pausedTime) / 1000
      const currentProgress = Math.min(elapsed / duration, 1)
      setProgress(currentProgress)

      if (currentProgress >= 1) {
        clearInterval(interval)
        if (onCompleteRef.current) onCompleteRef.current()
      }
    }, 100) // Update every 100ms for smooth percentage display

    return () => clearInterval(interval)
  }, [isPaused, startTime, pausedTime, duration])

  // Handle pause/resume time tracking
  useEffect(() => {
    if (isPaused && startTime) {
      const pauseStart = Date.now()
      return () => {
        setPausedTime(prev => prev + (Date.now() - pauseStart))
      }
    }
  }, [isPaused, startTime])

  // Initialize ball state on mount
  useEffect(() => {
    // Calculate bounds and initialize ball
    boundsRef.current = calculateBounds()
    ballStateRef.current = initializeBall(boundsRef.current)

    // Set initial position
    x.set(ballStateRef.current.x)
    y.set(ballStateRef.current.y)
  }, [x, y])

  // Physics animation loop (optimized for 60 FPS)
  useAnimationFrame((_t, deltaTime) => {
    if (isPaused || !ballStateRef.current) return

    // Convert deltaTime from ms to seconds
    const dt = deltaTime / 1000

    const ball = ballStateRef.current
    const bounds = boundsRef.current

    // Update position (in-place for performance)
    ball.x += ball.vx * dt
    ball.y += ball.vy * dt

    // Detect and handle collisions
    const hitLeft = ball.x <= bounds.left
    const hitRight = ball.x >= bounds.right
    const hitTop = ball.y <= bounds.top
    const hitBottom = ball.y >= bounds.bottom

    if (hitLeft || hitRight || hitTop || hitBottom) {
      // Reflect velocity
      if (hitLeft || hitRight) ball.vx = -ball.vx
      if (hitTop || hitBottom) ball.vy = -ball.vy

      // Add random deviation (±30°)
      const currentAngle = Math.atan2(ball.vy, ball.vx)
      const randomDeviation = (Math.random() - 0.5) * (Math.PI / 3) // ±π/6
      const newAngle = currentAngle + randomDeviation

      // Normalize to maintain constant speed
      ball.vx = Math.cos(newAngle) * ball.speed
      ball.vy = Math.sin(newAngle) * ball.speed

      // Clamp position to bounds
      ball.x = Math.max(bounds.left, Math.min(bounds.right, ball.x))
      ball.y = Math.max(bounds.top, Math.min(bounds.bottom, ball.y))
    }

    // Update visual position (GPU-accelerated, no re-render)
    x.set(ball.x)
    y.set(ball.y)
  })

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
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

      {/* Progress bar (使用 motion.div 動畫,無 re-render) */}
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
            animate={isPaused ? undefined : { width: '100%' }}
            transition={{
              duration: duration,
              ease: 'linear',
            }}
          />
        </div>
      </div>

      {/* Tracking ball - positioned absolutely using physics coordinates (center point) */}
      <motion.div
        className="absolute w-16 h-16 rounded-full bg-blue-500 shadow-lg flex items-center justify-center"
        style={{
          ...gpuAcceleratedStyle,
          x,
          y,
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.5)',
          // Offset by half ball size to position by center point
          left: -BALL_RADIUS,
          top: -BALL_RADIUS,
        }}
      >
        <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white opacity-50" />
        </div>
      </motion.div>

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
