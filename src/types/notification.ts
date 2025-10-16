import type { TimerEvent } from './events'

/**
 * Notification permission states
 * Maps to browser Notification API permission values
 */
export enum NotificationPermissionState {
  Granted = 'granted',
  Denied = 'denied',
  Default = 'default',
  Checking = 'checking',
}

/**
 * Notification types aligned with timer event types
 */
export enum NotificationType {
  WorkComplete = 'WORK_COMPLETE',
  BreakComplete = 'BREAK_COMPLETE',
}

/**
 * Notification settings stored in settingsStore
 * Extends SettingsStore with notification preferences
 */
export interface NotificationSettings {
  browserNotificationEnabled: boolean
  audioEnabled: boolean
  vibrationEnabled: boolean
  audioVolume: number // 0-100
}

/**
 * Configuration for triggering a notification
 */
export interface NotificationConfig {
  type: NotificationType
  title: string
  body: string
  icon?: string
  vibrationPattern?: number[]
  audioFile?: string
}

/**
 * State of the in-app notification popup
 */
export interface PopupState {
  visible: boolean
  message: string
  type: NotificationType
  autoDismissTimer: number
}

/**
 * Task in notification queue (for preventing duplicate notifications)
 */
export interface NotificationTask {
  id: string
  type: NotificationType
  timestamp: number
  config: NotificationConfig
}

/**
 * Main NotificationManager interface
 * Orchestrates all notification channels
 */
export interface NotificationManager {
  /**
   * Initialize the notification system
   * Sets up permissions, audio, ServiceWorker, and event subscriptions
   */
  initialize(): Promise<void>

  /**
   * Request browser notification permission
   * @returns Current permission state after request
   */
  requestPermission(): Promise<NotificationPermissionState>

  /**
   * Handle timer event and trigger appropriate notifications
   * @param event Timer event from timerEventEmitter
   */
  handleTimerEvent(event: TimerEvent): void

  /**
   * Clean up resources and unsubscribe from events
   */
  cleanup(): void

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermissionState
}

/**
 * Vibration pattern type
 */
export type VibrationPattern = number[]

/**
 * Audio file types for notifications
 */
export type AudioFile = 'work-complete.mp3' | 'break-complete.mp3'

/**
 * PermissionManager interface
 */
export interface PermissionManager {
  requestBrowserPermission(): Promise<NotificationPermissionState>
  getPermissionStatus(): NotificationPermissionState
  isPermissionGranted(): boolean
}

/**
 * AudioPlayer interface
 */
export interface AudioPlayer {
  load(): Promise<void>
  play(type: NotificationType, volume: number): Promise<void>
  setVolume(level: number): void
  stop(): void
}

/**
 * VibrationController interface
 */
export interface VibrationController {
  isSupported(): boolean
  vibrate(pattern: VibrationPattern): void
  cancel(): void
  getPatternForType(type: NotificationType): VibrationPattern
}

/**
 * ServiceWorkerManager interface
 */
export interface ServiceWorkerManager {
  register(): Promise<ServiceWorkerRegistration | null>
  getRegistration(): Promise<ServiceWorkerRegistration | undefined>
  unregister(): Promise<boolean>
}
