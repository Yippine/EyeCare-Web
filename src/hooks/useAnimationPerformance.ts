/**
 * Animation Performance Hook
 * Formula: PerformanceOptimization = GPUAcceleration × ReducedMotionDetection × FPSMonitoring
 *
 * This hook provides animation performance utilities including:
 * - Reduced motion preference detection
 * - GPU acceleration setup
 * - FPS monitoring (optional)
 */

import { useEffect, useState, useRef } from 'react'
import type {
  AnimationPerformance,
  ReducedMotionSettings,
} from '../types/animation'

/**
 * Hook to detect prefers-reduced-motion setting
 * Formula: detectReducedMotion() -> boolean
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    // Legacy browsers
    else {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  return prefersReducedMotion
}

/**
 * Hook for animation performance monitoring
 * Formula: FPSMonitor = frameTime × droppedFrames × fps
 */
export const useAnimationPerformance = (
  enabled = false
): AnimationPerformance | null => {
  const [performance, setPerformance] = useState<AnimationPerformance | null>(
    null
  )
  const frameTimesRef = useRef<number[]>([])
  const lastFrameTimeRef = useRef<number>(0)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const measurePerformance = (timestamp: number) => {
      if (lastFrameTimeRef.current !== 0) {
        const frameTime = timestamp - lastFrameTimeRef.current

        // Store frame times (keep last 60 frames)
        frameTimesRef.current.push(frameTime)
        if (frameTimesRef.current.length > 60) {
          frameTimesRef.current.shift()
        }

        // Calculate average FPS every 60 frames
        if (frameTimesRef.current.length === 60) {
          const avgFrameTime =
            frameTimesRef.current.reduce((sum, time) => sum + time, 0) / 60
          const fps = 1000 / avgFrameTime
          const droppedFrames = frameTimesRef.current.filter(
            time => time > 16.67
          ).length // Frames slower than 60 FPS

          setPerformance({
            fps: Math.round(fps),
            frameTime: avgFrameTime,
            droppedFrames,
            timestamp: Date.now(),
          })

          // Reset for next measurement
          frameTimesRef.current = []
        }
      }

      lastFrameTimeRef.current = timestamp
      animationFrameRef.current = requestAnimationFrame(measurePerformance)
    }

    animationFrameRef.current = requestAnimationFrame(measurePerformance)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [enabled])

  return performance
}

/**
 * Get reduced motion settings with fallback values
 * Formula: getReducedMotionSettings(prefersReducedMotion) -> ReducedMotionSettings
 */
export const getReducedMotionSettings = (
  prefersReducedMotion: boolean
): ReducedMotionSettings => {
  return {
    prefersReducedMotion,
    fallbackDuration: prefersReducedMotion ? 0.1 : 0.3,
    disableComplexAnimations: prefersReducedMotion,
  }
}

/**
 * Hook to combine all animation performance features
 * Formula: useAnimationFeatures = reducedMotion + performanceMonitoring + GPUAcceleration
 */
export const useAnimationFeatures = (monitorPerformance = false) => {
  const prefersReducedMotion = useReducedMotion()
  const performance = useAnimationPerformance(monitorPerformance)
  const reducedMotionSettings = getReducedMotionSettings(prefersReducedMotion)

  return {
    prefersReducedMotion,
    reducedMotionSettings,
    performance,
    // GPU acceleration is always enabled via CSS (see animationVariants.ts)
    gpuAccelerated: true,
  }
}

/**
 * Get optimal animation duration based on reduced motion preference
 */
export const getOptimalDuration = (
  baseDuration: number,
  prefersReducedMotion: boolean
): number => {
  return prefersReducedMotion ? Math.min(baseDuration * 0.1, 0.1) : baseDuration
}

/**
 * Check if device supports GPU acceleration
 * Formula: supportsGPU() -> boolean
 */
export const supportsGPUAcceleration = (): boolean => {
  // Check for 3D transform support
  const testElement = document.createElement('div')
  testElement.style.transform = 'translateZ(0)'
  const has3DSupport = testElement.style.transform !== ''

  // Check for will-change support
  const hasWillChangeSupport = 'willChange' in testElement.style

  return has3DSupport && hasWillChangeSupport
}

/**
 * Log animation performance for debugging
 */
export const logAnimationPerformance = (
  performance: AnimationPerformance
): void => {
  if (performance.fps < 50) {
    console.warn(
      `[Animation Performance] Low FPS detected: ${performance.fps} FPS`,
      `Frame time: ${performance.frameTime.toFixed(2)}ms`,
      `Dropped frames: ${performance.droppedFrames}/60`
    )
  } else {
    console.log(
      `[Animation Performance] Good performance: ${performance.fps} FPS`,
      `Frame time: ${performance.frameTime.toFixed(2)}ms`
    )
  }
}
