import { timerEventEmitter } from './eventEmitter'
import { permissionManager } from './permissionManager'
import { audioPlayer } from './audioPlayer'
import { vibrationController } from './vibrationController'
import { serviceWorkerManager } from './serviceWorkerManager'
import { useSettingsStore } from '../stores/settingsStore'
import {
  NotificationType,
  type NotificationManager as INotificationManager,
  type NotificationConfig,
  NotificationPermissionState,
} from '../types/notification'
import { TimerEventType, type TimerEvent } from '../types/events'

/**
 * Central notification orchestrator
 * Coordinates all notification channels and integrates with timer events
 */
class NotificationManagerImpl implements INotificationManager {
  private unsubscribeFunctions: (() => void)[] = []
  private popupCallback:
    | ((message: string, type: NotificationType) => void)
    | null = null

  /**
   * Initialize the notification system
   * Sets up permissions, audio, ServiceWorker, and event subscriptions
   */
  async initialize(): Promise<void> {
    console.log('[NotificationManager] Initializing...')

    try {
      // Load audio files
      await audioPlayer.load()

      // Register ServiceWorker (only in production)
      await serviceWorkerManager.register()

      // Subscribe to timer events
      this.subscribeToTimerEvents()

      console.log('[NotificationManager] Initialization complete')
    } catch (error) {
      console.error('[NotificationManager] Initialization error:', error)
      // Continue despite errors - graceful degradation
    }
  }

  /**
   * Subscribe to timer completion events
   */
  private subscribeToTimerEvents(): void {
    // Subscribe to work complete event
    const unsubscribeWork = timerEventEmitter.subscribe(
      TimerEventType.WORK_COMPLETE,
      this.handleWorkComplete.bind(this)
    )

    // Subscribe to break complete event
    const unsubscribeBreak = timerEventEmitter.subscribe(
      TimerEventType.BREAK_COMPLETE,
      this.handleBreakComplete.bind(this)
    )

    this.unsubscribeFunctions.push(unsubscribeWork, unsubscribeBreak)
    console.log('[NotificationManager] Subscribed to timer events')
  }

  /**
   * Handle work complete event
   * Triggers all notification channels based on settings
   */
  private handleWorkComplete(event: TimerEvent): void {
    console.log('[NotificationManager] Work complete event received', event)

    const config: NotificationConfig = {
      type: NotificationType.WorkComplete,
      title: 'Work Period Complete!',
      body: 'Time for a 20-second eye care break. Look at something 20 feet away.',
      icon: '/icon-192x192.png',
    }

    this.triggerNotifications(config)
  }

  /**
   * Handle break complete event
   * Triggers all notification channels based on settings
   */
  private handleBreakComplete(event: TimerEvent): void {
    console.log('[NotificationManager] Break complete event received', event)

    const config: NotificationConfig = {
      type: NotificationType.BreakComplete,
      title: 'Break Complete!',
      body: 'Great job! Ready to continue working?',
      icon: '/icon-192x192.png',
    }

    this.triggerNotifications(config)
  }

  /**
   * Trigger all notification channels based on configuration and settings
   */
  private triggerNotifications(config: NotificationConfig): void {
    const settings = useSettingsStore.getState()

    // 1. In-app popup (always show - primary notification method)
    this.showInAppPopup(config.body, config.type)

    // 2. Browser notification (only if permission granted AND setting enabled)
    if (
      settings.browserNotificationEnabled &&
      permissionManager.isPermissionGranted()
    ) {
      this.showBrowserNotification(config.title, config.body, config.icon)
    }

    // 3. Audio (only if enabled)
    if (settings.audioEnabled) {
      audioPlayer.play(config.type, settings.audioVolume).catch(error => {
        console.error('[NotificationManager] Audio playback error:', error)
      })
    }

    // 4. Vibration (only if enabled AND supported)
    if (settings.vibrationEnabled && vibrationController.isSupported()) {
      const pattern = vibrationController.getPatternForType(config.type)
      vibrationController.vibrate(pattern)
    }
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(
    title: string,
    body: string,
    icon?: string
  ): void {
    try {
      const notification = new Notification(title, {
        body,
        icon: icon || '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'eyecare-notification', // Prevent duplicate notifications
        requireInteraction: false,
        silent: true, // We handle audio separately
      })

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      console.log('[NotificationManager] Browser notification shown')
    } catch (error) {
      console.error('[NotificationManager] Browser notification error:', error)
    }
  }

  /**
   * Show in-app popup notification
   */
  private showInAppPopup(message: string, type: NotificationType): void {
    if (this.popupCallback) {
      this.popupCallback(message, type)
      console.log('[NotificationManager] In-app popup triggered')
    } else {
      console.warn('[NotificationManager] No popup callback registered')
    }
  }

  /**
   * Register popup callback (called by useNotification hook)
   */
  setPopupCallback(
    callback: (message: string, type: NotificationType) => void
  ): void {
    this.popupCallback = callback
  }

  /**
   * Request browser notification permission
   */
  async requestPermission(): Promise<NotificationPermissionState> {
    return await permissionManager.requestBrowserPermission()
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermissionState {
    return permissionManager.getPermissionStatus()
  }

  /**
   * Handle timer event (public API)
   */
  handleTimerEvent(event: TimerEvent): void {
    if (event.type === TimerEventType.WORK_COMPLETE) {
      this.handleWorkComplete(event)
    } else if (event.type === TimerEventType.BREAK_COMPLETE) {
      this.handleBreakComplete(event)
    }
  }

  /**
   * Clean up resources and unsubscribe from events
   */
  cleanup(): void {
    console.log('[NotificationManager] Cleaning up...')

    // Unsubscribe from all events
    this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe())
    this.unsubscribeFunctions = []

    // Stop any playing audio
    audioPlayer.stop()

    // Cancel any vibration
    vibrationController.cancel()

    this.popupCallback = null

    console.log('[NotificationManager] Cleanup complete')
  }
}

// Singleton instance
export const notificationManager = new NotificationManagerImpl()
