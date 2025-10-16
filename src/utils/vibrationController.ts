import {
  NotificationType,
  type VibrationController as IVibrationController,
  type VibrationPattern,
} from '../types/notification'

/**
 * Manages device vibration for notifications
 * Provides pattern-based vibration with mobile-first design
 */
class VibrationControllerImpl implements IVibrationController {
  // Vibration patterns for different notification types
  private readonly patterns = {
    [NotificationType.WorkComplete]: [200, 100, 200], // Three short bursts
    [NotificationType.BreakComplete]: [100], // Single short burst
  }

  /**
   * Check if Vibration API is supported
   * @returns true if vibration is supported
   */
  isSupported(): boolean {
    return 'vibrate' in navigator && typeof navigator.vibrate === 'function'
  }

  /**
   * Vibrate device with specified pattern
   * @param pattern Array of vibration durations in milliseconds
   */
  vibrate(pattern: VibrationPattern): void {
    if (!this.isSupported()) {
      console.log('Vibration API not supported on this device')
      return
    }

    try {
      navigator.vibrate(pattern)
    } catch (error) {
      console.error('Error triggering vibration:', error)
    }
  }

  /**
   * Cancel any ongoing vibration
   */
  cancel(): void {
    if (!this.isSupported()) {
      return
    }

    try {
      navigator.vibrate(0)
    } catch (error) {
      console.error('Error canceling vibration:', error)
    }
  }

  /**
   * Get predefined vibration pattern for notification type
   * @param type Notification type
   * @returns Vibration pattern for the given type
   */
  getPatternForType(type: NotificationType): VibrationPattern {
    return this.patterns[type]
  }
}

// Singleton instance
export const vibrationController = new VibrationControllerImpl()
