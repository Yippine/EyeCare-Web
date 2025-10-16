/**
 * Animation Type Definitions
 * Formula: AnimationTypes = MotionVariants + AnimationConfig + PerformanceSettings
 */

import type { Variant, Transition } from 'framer-motion'

/**
 * Animation variant names
 */
export enum AnimationVariant {
  FADE_IN = 'fadeIn',
  FADE_OUT = 'fadeOut',
  SCALE_SPRING = 'scaleSpring',
  SLIDE_TRACK = 'slideTrack',
  PULSE_EFFECT = 'pulseEffect',
  BLINK_OVERLAY = 'blinkOverlay',
}

/**
 * Animation configuration
 * Formula: AnimationConfig = duration + easing + delay + repeat
 */
export interface AnimationConfig {
  duration?: number
  ease?: string | number[]
  delay?: number
  repeat?: number
  repeatType?: 'loop' | 'reverse' | 'mirror'
  repeatDelay?: number
}

/**
 * Motion variants type (compatible with Framer Motion)
 */
export type MotionVariants = {
  [key: string]: Variant
}

/**
 * Spring animation configuration
 * Formula: SpringConfig = stiffness + damping + mass
 */
export interface SpringConfig {
  type: 'spring'
  stiffness?: number
  damping?: number
  mass?: number
  velocity?: number
}

/**
 * Tween animation configuration
 * Formula: TweenConfig = duration + ease + times
 */
export interface TweenConfig {
  type?: 'tween'
  duration?: number
  ease?: string | number[]
  times?: number[]
}

/**
 * Animation transition (union of spring and tween)
 */
export type AnimationTransition = SpringConfig | TweenConfig | Transition

/**
 * Performance optimization settings
 * Formula: PerformanceSettings = willChange + GPUAcceleration + reducedMotion
 */
export interface PerformanceSettings {
  willChange?: string
  transform?: string
  backfaceVisibility?: 'visible' | 'hidden'
  perspective?: number
  gpuAcceleration?: boolean
  reducedMotion?: boolean
}

/**
 * Animation path for ball tracking
 * Formula: AnimationPath = keyframes + duration + transition
 */
export interface AnimationPath {
  keyframes: {
    x: (string | number)[]
    y: (string | number)[]
  }
  duration: number
  transition: AnimationTransition
}

/**
 * Animation state for component control
 */
export interface AnimationState {
  isAnimating: boolean
  currentVariant: string
  progress: number
  startTime: number | null
}

/**
 * Reduced motion preference detection
 */
export interface ReducedMotionSettings {
  prefersReducedMotion: boolean
  fallbackDuration: number // Shorter duration for reduced motion
  disableComplexAnimations: boolean
}

/**
 * Animation performance metrics
 * Formula: PerformanceMetrics = fps + frameTime + droppedFrames
 */
export interface AnimationPerformance {
  fps: number
  frameTime: number // milliseconds
  droppedFrames: number
  timestamp: number
}

/**
 * Exercise animation configuration
 * Formula: ExerciseAnimationConfig = path + timing + performance
 */
export interface ExerciseAnimationConfig {
  // Path configuration
  path?: AnimationPath

  // Timing
  duration: number
  delay?: number

  // Performance
  performance: PerformanceSettings

  // Accessibility
  reducedMotion?: ReducedMotionSettings
}
