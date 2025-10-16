import {
  NotificationPermissionState,
  type PermissionManager,
} from '../types/notification'

/**
 * Manages browser notification permissions
 * Provides utilities to request and check notification permissions
 */
class PermissionManagerImpl implements PermissionManager {
  /**
   * Check if Notification API is supported
   */
  private isNotificationSupported(): boolean {
    return 'Notification' in window
  }

  /**
   * Request browser notification permission
   * Only requests if current status is 'default'
   * @returns Current permission state after request
   */
  async requestBrowserPermission(): Promise<NotificationPermissionState> {
    if (!this.isNotificationSupported()) {
      console.warn('Notification API not supported in this browser')
      return NotificationPermissionState.Denied
    }

    try {
      const currentPermission = Notification.permission

      // Only request if permission is 'default'
      if (currentPermission === 'default') {
        const result = await Notification.requestPermission()
        return result as NotificationPermissionState
      }

      return currentPermission as NotificationPermissionState
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return NotificationPermissionState.Denied
    }
  }

  /**
   * Get current notification permission status
   * @returns Current permission state
   */
  getPermissionStatus(): NotificationPermissionState {
    if (!this.isNotificationSupported()) {
      return NotificationPermissionState.Denied
    }

    return Notification.permission as NotificationPermissionState
  }

  /**
   * Check if notification permission is granted
   * @returns true if permission is granted
   */
  isPermissionGranted(): boolean {
    return (
      this.isNotificationSupported() &&
      Notification.permission === NotificationPermissionState.Granted
    )
  }
}

// Singleton instance
export const permissionManager = new PermissionManagerImpl()
