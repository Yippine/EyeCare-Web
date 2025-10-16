/**
 * Animation Variants Configuration
 * Formula: AnimationEngine = FramerMotionVariants × PerformanceOptimization × A11ySupport
 *
 * This file defines reusable animation variants for Framer Motion
 * All animations are optimized for 60 FPS and support prefers-reduced-motion
 */

import type { Variants, Transition } from 'framer-motion'

/**
 * Default spring configuration for smooth, natural animations
 * Formula: SpringPhysics = stiffness(300) × damping(30) × mass(1)
 */
export const defaultSpring: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 1,
}

/**
 * Gentle spring for subtle animations
 */
export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
  mass: 1,
}

/**
 * Bouncy spring for playful animations
 */
export const bouncySpring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 20,
  mass: 1,
}

/**
 * Smooth tween for linear animations
 */
export const smoothTween: Transition = {
  duration: 0.3,
  ease: 'easeInOut',
}

/**
 * Fade in/out variants
 * Formula: FadeVariant = opacity(0->1) × duration(0.3s)
 */
export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: smoothTween,
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

/**
 * Scale spring variants for entrance/exit animations
 * Formula: ScaleSpring = scale(0.8->1) × opacity(0->1) × spring
 */
export const scaleSpringVariants: Variants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: defaultSpring,
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

/**
 * Slide variants for overlay entrance
 * Formula: SlideVariant = y(100%->0) × opacity(0->1)
 */
export const slideVariants: Variants = {
  hidden: {
    y: '100%',
    opacity: 0,
  },
  visible: {
    y: '0%',
    opacity: 1,
    transition: defaultSpring,
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: smoothTween,
  },
}

/**
 * Pulse effect variants for focus prompts
 * Formula: PulseEffect = scale(1->1.2->1) × loop
 */
export const pulseVariants: Variants = {
  idle: {
    scale: 1,
  },
  pulse: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

/**
 * Blink overlay variants
 * Formula: BlinkOverlay = opacity(0->0.8->0) × duration(0.3s)
 */
export const blinkOverlayVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 0.8,
    transition: { duration: 0.15 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
}

/**
 * Ball tracking path variants
 * These are base configurations; actual paths are generated dynamically
 */
export const ballTrackingVariants: Variants = {
  initial: {
    x: '0%',
    y: '0%',
    scale: 1,
  },
  animate: {
    x: ['0%', '100%', '0%'],
    y: ['0%', '50%', '0%'],
    transition: {
      duration: 20,
      ease: 'linear',
      repeat: 0,
    },
  },
}

/**
 * Near-far focus variants
 * Formula: FocusVariant = scale(0.5->1.5) × cycle(3)
 */
export const nearFarVariants: Variants = {
  near: {
    scale: 0.5,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: 'easeInOut',
    },
  },
  far: {
    scale: 1.5,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: 'easeInOut',
    },
  },
}

/**
 * Progress bar variants
 */
export const progressVariants: Variants = {
  initial: {
    scaleX: 0,
  },
  animate: {
    scaleX: 1,
    transition: {
      duration: 20,
      ease: 'linear',
    },
  },
}

/**
 * Reduced motion variants (fallback)
 * Formula: ReducedMotion = minimal_animation + instant_transition
 */
export const reducedMotionVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: { duration: 0.1 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.1 },
  },
}

/**
 * GPU-accelerated style for performance optimization
 * Formula: GPUOptimization = transform3d + willChange + backfaceVisibility
 */
export const gpuAcceleratedStyle = {
  willChange: 'transform, opacity',
  backfaceVisibility: 'hidden' as const,
  WebkitBackfaceVisibility: 'hidden' as const,
  transform: 'translateZ(0)',
}

/**
 * Get appropriate variants based on reduced motion preference
 * Formula: getVariants(prefersReducedMotion) -> variants
 */
export const getVariants = (
  prefersReducedMotion: boolean,
  variants: Variants
): Variants => {
  if (prefersReducedMotion) {
    return reducedMotionVariants
  }
  return variants
}

/**
 * Animation configuration for exercises
 */
export const exerciseAnimationConfig = {
  ballTracking: {
    duration: 20, // 20 seconds
    pathTypes: ['horizontal', 'vertical', 'circular', 'figure8'] as const,
  },
  nearFarFocus: {
    cycleDuration: 6, // 6 seconds per cycle (3s near + 3s far)
    totalCycles: 3,
    totalDuration: 18, // 18 seconds total
  },
  blinkExercise: {
    maxBlinks: 10,
    blinkDuration: 0.3, // 300ms per blink
    promptInterval: 2, // Prompt every 2 seconds
  },
}
